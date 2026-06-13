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
  { key: "hip", label: "대퇴골두 중심 (Hip)", color: "#0ea5e9", optional: false },
  {
    key: "femMedial",
    label: "대퇴 내측 과 (Femoral medial condyle)",
    color: "#ec4899",
    optional: true,
  },
  {
    key: "femLateral",
    label: "대퇴 외측 과 (Femoral lateral condyle)",
    color: "#ec4899",
    optional: true,
  },
  {
    key: "medial",
    label: "경골 내측 가장자리 (Medial plateau)",
    color: "#f59e0b",
    optional: false,
  },
  {
    key: "lateral",
    label: "경골 외측 가장자리 (Lateral plateau)",
    color: "#f59e0b",
    optional: false,
  },
  { key: "ankle", label: "족관절 중심 (Ankle)", color: "#0ea5e9", optional: false },
  {
    key: "hinge",
    label: "절골 회전축 / 외측 경첩 (Hinge)",
    color: "#a855f7",
    optional: false,
  },
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
  const qp = sub(hip, medial); // 기준점: hip − medial (교점의 medial→lateral 파라미터 부호)
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

/** 무릎 중심 = 평탄부 내측·외측 중점 (별도 랜드마크 없이 유도) */
export function kneeCenter(lm: Landmarks): Point | null {
  const { medial, lateral } = lm;
  if (!medial || !lateral) return null;
  return { x: (medial.x + lateral.x) / 2, y: (medial.y + lateral.y) / 2 };
}

/** 두 벡터 사이 각도 (0~180도) */
function angleBetween(v1: Point, v2: Point): number {
  const dot = v1.x * v2.x + v1.y * v2.y;
  const m = Math.hypot(v1.x, v1.y) * Math.hypot(v2.x, v2.y);
  if (m === 0) return 0;
  const c = Math.min(1, Math.max(-1, dot / m));
  return (Math.acos(c) * 180) / Math.PI;
}

export interface Alignment {
  /** HKA 편위각 (도, 양수=내반 varus, 음수=외반 valgus) */
  hkaDeviation: number;
  side: "varus" | "valgus" | "neutral";
  /** 내측 근위 경골각 MPTA (도) — 정상 약 85~90° */
  mpta: number;
  /** 관절선 수렴각 JLCA (도) — 정상 약 0~2°. 대퇴 과 랜드마크 필요 */
  jlca: number | null;
  /** 역학적 외측 원위 대퇴각 mLDFA (도) — 정상 약 85~90°. 대퇴 과 랜드마크 필요 */
  mldfa: number | null;
}

/** HKA·MPTA(필수) + JLCA·mLDFA(대퇴 과 입력 시) 계산 */
export function computeAlignment(lm: Landmarks): Alignment | null {
  const { hip, ankle, femMedial, femLateral } = lm;
  const knee = kneeCenter(lm);
  const pct = currentWblPercent(lm);
  if (!hip || !ankle || !knee || !lm.medial || !lm.lateral || pct === null)
    return null;

  // HKA 편위 = 180 - ∠(hip-knee-ankle)
  const hkaInner = angleBetween(sub(hip, knee), sub(ankle, knee));
  const hkaDeviation = 180 - hkaInner;
  // 부호/측: WBL이 내측(<50%)이면 내반
  const side: Alignment["side"] =
    pct < 48 ? "varus" : pct > 52 ? "valgus" : "neutral";
  const signed = side === "valgus" ? -hkaDeviation : hkaDeviation;

  // MPTA = 경골 역학축(knee→ankle)과 관절선(lateral→medial) 사이 내측각
  const mpta = angleBetween(sub(ankle, knee), sub(lm.medial, lm.lateral));

  // JLCA / mLDFA : 대퇴 관절선(femMedial-femLateral)이 있어야 산출
  let jlca: number | null = null;
  let mldfa: number | null = null;
  if (femMedial && femLateral) {
    // JLCA = 대퇴 관절선과 경골 관절선 사이 각 (수렴각)
    jlca = angleBetween(
      sub(femLateral, femMedial),
      sub(lm.lateral, lm.medial)
    );
    // mLDFA = 대퇴 역학축(femKnee→hip)과 대퇴 관절선(femMedial→femLateral) 외측각
    const femKnee = { x: (femMedial.x + femLateral.x) / 2, y: (femMedial.y + femLateral.y) / 2 };
    mldfa = angleBetween(sub(hip, femKnee), sub(femLateral, femMedial));
  }

  return { hkaDeviation: signed, side, mpta, jlca, mldfa };
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
  /** 교정 전 MPTA (도) */
  currentMpta: number | null;
  /** 교정 후 예상 MPTA (도) = 교정 전 + 교정각 */
  predictedMpta: number | null;
  /** 안전·금기 경고 메시지 */
  warnings: string[];
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

  const correctionDeg = round(Math.abs((rotationRad * 180) / Math.PI), 0.5);

  // 개대 쐐기 높이: gap = 절골선 길이 × tan(교정각)
  // px/mm 는 평탄부 폭(medial-lateral) 픽셀 ↔ 입력 mm 로 캘리브레이션.
  // 절골선 길이는 외측 경첩→내측 피질 거리(기하)로 산출(평탄부 폭 직접 대입보다 정확).
  let wedgeHeightMm: number | null = null;
  if (tibiaWidthMm && tibiaWidthMm > 0) {
    const mlPx = dist(medial, lateral);
    const pxPerMm = mlPx / tibiaWidthMm;
    if (pxPerMm > 0) {
      const osteotomyLenMm = dist(hinge, medial) / pxPerMm;
      wedgeHeightMm = round(
        osteotomyLenMm * Math.tan((correctionDeg * Math.PI) / 180),
        0.5
      );
    }
  }

  // 정렬 각도 및 안전 경고
  const align = computeAlignment(lm);
  const currentMpta = align ? round(align.mpta, 0.5) : null;
  const predictedMpta =
    currentMpta !== null ? round(currentMpta + correctionDeg, 0.5) : null;

  const warnings: string[] = [];
  // 랜드마크 배치 정합성 가드 (잘못 찍었을 때 조용히 틀린 값이 나오는 것 방지)
  if (currentPct < -5 || currentPct > 105) {
    warnings.push(
      "역학축이 경골 평탄부 폭을 벗어났습니다 — Hip·Ankle·평탄부 랜드마크 배치를 재확인하세요."
    );
  }
  const kneeC = kneeCenter(lm);
  if (kneeC && (hip.y > kneeC.y || kneeC.y > ankle.y)) {
    warnings.push(
      "근위-원위(상하) 순서가 비정상입니다 — Hip이 가장 위, Ankle이 가장 아래가 되도록 확인하세요."
    );
  }
  if (predictedMpta !== null && predictedMpta > 95) {
    warnings.push(
      `교정 후 MPTA ${predictedMpta}° (>95°): 관절선 경사 과도 — 과교정/이중 절골술 고려.`
    );
  }
  if (correctionDeg > 12) {
    warnings.push(
      `교정각 ${correctionDeg}° (>12°): 개방 폭 과대로 외측 경첩 골절 위험 — 대안 술식 고려.`
    );
  }
  if (targetPct > 50 && currentPct >= 50) {
    warnings.push(
      "현재 정렬이 이미 중립~외반입니다. 내측 개방 HTO 적응증을 재확인하세요."
    );
  }
  if (align?.jlca != null && align.jlca > 4) {
    warnings.push(
      `JLCA ${round(align.jlca, 0.5)}° (>4°): 관절내 변형/인대 이완 가능 — 내반의 상당분이 관절내 기원일 수 있어 관절외 과교정에 주의.`
    );
  }
  if (align?.mldfa != null && (align.mldfa > 90 || align.mldfa < 85)) {
    warnings.push(
      `mLDFA ${round(align.mldfa, 0.5)}° (정상 85~90°): 대퇴측 변형 가능 — 변형 기원 부위(원위 대퇴 절골술 등) 교정을 고려.`
    );
  }

  return {
    currentPct: round(currentPct, 1),
    targetPct,
    fujisawa,
    newAnkle,
    correctionDeg,
    rotationRad,
    wedgeHeightMm,
    currentMpta,
    predictedMpta,
    warnings,
  };
}

/** value 를 step 단위로 반올림 (거짓 정밀도 방지) */
function round(value: number, step: number): number {
  return Math.round(value / step) * step;
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
