// HTO (High Tibial Osteotomy) 기하 계산 라이브러리
//
// 모든 계산은 결정론적(deterministic)입니다. LLM 추론과 분리되어 있으며,
// 입력은 사용자가 영상 위에 찍은 랜드마크 좌표(픽셀 단위)입니다.
//
// 좌표계: 캔버스 픽셀 좌표 (x: 우측+, y: 하단+).
// 주의: 본 계산은 기하 시뮬레이션이며 실제 수술 결과 예측이 아닙니다.

export interface Point {
  x: number;
  y: number;
}

/** Fujisawa 표준 목표 WBL 통과 위치 (내측에서 62%) */
export const FUJISAWA_TARGET_PCT = 62;

export const LANDMARK_DEFS = [
  { key: "hip", label: "대퇴골두 중심 (Hip)", color: "#0ea5e9" },
  { key: "medial", label: "경골 내측 가장자리 (Medial plateau)", color: "#f59e0b" },
  { key: "lateral", label: "경골 외측 가장자리 (Lateral plateau)", color: "#f59e0b" },
  { key: "ankle", label: "족관절 중심 (Ankle)", color: "#0ea5e9" },
  { key: "hinge", label: "절골 회전축 / 외측 경첩 (Hinge)", color: "#a855f7" },
] as const;

export type LandmarkKey = (typeof LANDMARK_DEFS)[number]["key"];
export type Landmarks = Partial<Record<LandmarkKey, Point>>;

function sub(a: Point, b: Point): Point {
  return { x: a.x - b.x, y: a.y - b.y };
}
function add(a: Point, b: Point): Point {
  return { x: a.x + b.x, y: a.y + b.y };
}
function scale(a: Point, s: number): Point {
  return { x: a.x * s, y: a.y * s };
}
function dist(a: Point, b: Point): number {
  return Math.hypot(a.x - b.x, a.y - b.y);
}

/**
 * 현재 역학축(Hip→Ankle)이 경골 평탄부 선분(Medial→Lateral)을 지나는 위치를
 * 내측(0%)~외측(100%) 백분율로 반환.
 */
export function currentWblPercent(lm: Landmarks): number | null {
  const { hip, ankle, medial, lateral } = lm;
  if (!hip || !ankle || !medial || !lateral) return null;
  // 직선 hip-ankle 과 선분 medial-lateral 의 교점을 medial-lateral 파라미터로 환산
  const r = sub(ankle, hip);
  const s = sub(lateral, medial);
  const denom = r.x * s.y - r.y * s.x;
  if (Math.abs(denom) < 1e-9) return null;
  const qp = sub(medial, hip);
  const u = (qp.x * r.y - qp.y * r.x) / -denom; // 파라미터 on medial->lateral
  return u * 100;
}

/** Fujisawa(목표 %) 점: medial + pct·(lateral−medial) */
export function targetPoint(lm: Landmarks, pct: number): Point | null {
  const { medial, lateral } = lm;
  if (!medial || !lateral) return null;
  return add(medial, scale(sub(lateral, medial), pct / 100));
}

/**
 * 직선(through P0,P1) 과 원(center O, 반지름 r)의 교점 중,
 * 기준점 near 에 가까운 해를 반환.
 */
function lineCircleIntersection(
  p0: Point,
  p1: Point,
  o: Point,
  r: number,
  near: Point
): Point | null {
  const d = sub(p1, p0);
  const f = sub(p0, o);
  const a = d.x * d.x + d.y * d.y;
  const b = 2 * (f.x * d.x + f.y * d.y);
  const c = f.x * f.x + f.y * f.y - r * r;
  const disc = b * b - 4 * a * c;
  if (disc < 0 || a === 0) return null;
  const sq = Math.sqrt(disc);
  const t1 = (-b - sq) / (2 * a);
  const t2 = (-b + sq) / (2 * a);
  const c1 = add(p0, scale(d, t1));
  const c2 = add(p0, scale(d, t2));
  return dist(c1, near) <= dist(c2, near) ? c1 : c2;
}

export interface CorrectionResult {
  currentPct: number;
  targetPct: number;
  /** 목표 WBL 점 (Fujisawa) */
  fujisawa: Point;
  /** 교정 후 족관절 중심 위치 (경첩 O 중심 회전) */
  newAnkle: Point;
  /** 교정각 (도, 양수 = 외반 교정) */
  correctionDeg: number;
  /** A→A' 부호 있는 회전각 (캔버스 라디안, 시각화용) */
  rotationRad: number;
  /** 개대 쐐기 높이 (mm). 캘리브레이션 없으면 null */
  wedgeHeightMm: number | null;
}

/**
 * Miniaci 변형 교정각 계산.
 *  1. 목표 WBL 점 F (Fujisawa)
 *  2. 새 역학축 = 직선(Hip, F)
 *  3. 새 족관절 A' = 직선(Hip,F) 과 원(O, |OA|) 의 교점 (기존 A 부근)
 *  4. 교정각 = ∠A-O-A'
 *
 * @param tibiaWidthMm 경골 평탄부(medial-lateral) 실제 폭(mm). 쐐기 높이 환산용.
 */
export function computeCorrection(
  lm: Landmarks,
  targetPct: number,
  tibiaWidthMm?: number | null
): CorrectionResult | null {
  const { hip, ankle, medial, lateral, hinge } = lm;
  if (!hip || !ankle || !medial || !lateral || !hinge) return null;

  const currentPct = currentWblPercent(lm);
  if (currentPct === null) return null;

  const fujisawa = add(medial, scale(sub(lateral, medial), targetPct / 100));

  const r = dist(hinge, ankle);
  const newAnkle = lineCircleIntersection(hip, fujisawa, hinge, r, ankle);
  if (!newAnkle) return null;

  // 경첩 O 기준 A→A' 부호 있는 각도
  const aRad = Math.atan2(ankle.y - hinge.y, ankle.x - hinge.x);
  const aPrimeRad = Math.atan2(newAnkle.y - hinge.y, newAnkle.x - hinge.x);
  let rotationRad = aPrimeRad - aRad;
  // [-π, π] 정규화
  while (rotationRad > Math.PI) rotationRad -= 2 * Math.PI;
  while (rotationRad < -Math.PI) rotationRad += 2 * Math.PI;

  const correctionDeg = Math.abs((rotationRad * 180) / Math.PI);

  // 개대 쐐기 높이: gap = 절골선 폭 × tan(교정각)
  // 절골선 폭은 경골 평탄부 폭(medial-lateral)으로 근사 (데모 근사).
  let wedgeHeightMm: number | null = null;
  if (tibiaWidthMm && tibiaWidthMm > 0) {
    wedgeHeightMm = tibiaWidthMm * Math.tan((correctionDeg * Math.PI) / 180);
  }

  return {
    currentPct,
    targetPct,
    fujisawa,
    newAnkle,
    correctionDeg,
    rotationRad,
    wedgeHeightMm,
  };
}

export interface ScenarioCard {
  id: string;
  title: string;
  cartilage: string;
  targetPct: number;
  note: string;
  tone: "amber" | "teal" | "sky";
}

/** 규칙기반 시나리오(연골 상태별 목표 WBL%). AI 자동판단이 아닌 의사 선택용. */
export const SCENARIOS: ScenarioCard[] = [
  {
    id: "good",
    title: "연골 양호 — 적극 교정",
    cartilage: "내측 연골 비교적 보존",
    targetPct: 65,
    note: "약간의 과교정으로 내측 부담을 충분히 외측으로 이동. 외측 구획 여유가 있을 때.",
    tone: "teal",
  },
  {
    id: "standard",
    title: "표준 — Fujisawa",
    cartilage: "일반적 내측 구획 관절염",
    targetPct: 62,
    note: "표준 목표점(62%). 가장 널리 쓰이는 기준.",
    tone: "sky",
  },
  {
    id: "damaged",
    title: "연골 손상 / 보수적",
    cartilage: "외측 구획 부담 우려·고령",
    targetPct: 58,
    note: "과교정 회피. 외측 연골 부담과 외관상 외반을 줄이고 싶을 때.",
    tone: "amber",
  },
];
