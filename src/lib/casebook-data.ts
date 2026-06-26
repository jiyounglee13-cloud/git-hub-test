// ---------------------------------------------------------------------------
// 실손보험 질환별 지급거절 사례집 — 룰 기반 데이터 & 카드 생성 엔진
//
// .claude/agents · .claude/skills 의 오케스트레이션 로직을 앱에서 실행 가능한
// 결정론적 룰로 이식한 것. 북극성: 거짓 희망 금지 · 정당 거절은 솔직히 안내.
// 모든 산출물은 참고용 초안이며 법률·보험 자문이 아니다.
// ---------------------------------------------------------------------------

export type Verdict = "정당 면책" | "다툼가능" | "사기위험";

/** 실손 세대 */
export interface Generation {
  id: string;
  label: string;
  period: string;
}

export const generations: Generation[] = [
  { id: "g1", label: "1세대", period: "~2009.9" },
  { id: "g2", label: "2세대", period: "2009.10~2013.3" },
  { id: "g3", label: "3세대", period: "2013.4~2017.3" },
  { id: "g4", label: "4세대", period: "2017.4~2021.6" },
  { id: "g5", label: "5세대", period: "2021.7~" },
];

/** 거절 사유 (legitimacy-screening 룰을 내장) */
export interface DenialReason {
  id: string;
  label: string;
  category: "의학적" | "절차적" | "면책";
  /** 룰 기반 1차 판정 */
  verdict: Verdict;
  /** 다툼가능일 때 핵심 쟁점 (evidenceKit 키와 연결) */
  issue?: "치료 필요성" | "인과관계" | "입원 실질";
  /** 사유 자체에 의료자문이 개입했는지 */
  involvesAdvisory?: boolean;
  /** clause-precedent-retriever 요지 */
  clausePoint?: string;
  proArg?: string;
  conArg?: string;
  /** 정당 면책일 때 수용 안내 */
  acceptNote?: string;
}

export const denialReasons: DenialReason[] = [
  {
    id: "necessity",
    label: "치료 필요성·효과 불인정",
    category: "의학적",
    verdict: "다툼가능",
    issue: "치료 필요성",
    clausePoint: "약관상 치료 목적 비급여의 보장 범위·제외 조항 확인",
    proArg:
      "주치의의 임상적 판단은 특별히 부당하다고 볼 객관적 사정이 없는 한 존중되어야 함(대법원 2021다234368). 치료 목적·반응·기능 호전을 객관적 기록으로 소명하면 조정 인정 여지",
    conArg: "증상 호전 없이 장기 반복되었다면 '유지치료'로 볼 여지가 있음",
  },
  {
    id: "causation",
    label: "인과관계 불충분(질병/상해 연관성)",
    category: "의학적",
    verdict: "다툼가능",
    issue: "인과관계",
    clausePoint: "보장 대상 질병·상해와의 연관성 입증 책임 분배 확인",
    proArg: "최초 진단·검사·경과 기록으로 인과관계를 시계열로 소명 가능",
    conArg: "기왕증·퇴행성 요인이 혼재하면 연관성 다툼이 길어질 수 있음",
  },
  {
    id: "advisory",
    label: "의료자문상 불필요",
    category: "의학적",
    verdict: "다툼가능",
    issue: "치료 필요성",
    involvesAdvisory: true,
    clausePoint: "약관에 '의료자문 결과 단독으로 부지급'을 명시한 근거가 있는지 확인",
    proArg:
      "의료자문 결과만으로 부지급·지연은 부당. 진료한 의사의 객관적 기록이 우선",
    conArg: "주치의 판단이 일반 의학 기준과 크게 동떨어진 경우엔 자문이 타당할 수 있음",
  },
  {
    id: "admission",
    label: "입원 적정성 불인정(통원 한도 적용)",
    category: "절차적",
    verdict: "다툼가능",
    issue: "입원 실질",
    clausePoint:
      "6시간 체류 형식요건만으로는 입원 불인정. '지속적 관찰 요보호 상태'를 증상·진단·치료로 종합 판단",
    proArg:
      "기저질환·생체징후 변화가 기록으로 확인되면 입원 인정 여지. 백내장+홍채섬모체염 입원 인정(광주지법 630만원), BMAC 혈압 162/100 급상승·아스피린 복용 사례 인정(서울중앙 2024가단55065)",
    conArg:
      "시술이 1시간 내외로 단순하고 사후 처치 없이 퇴원, 진료기록에 '증세 악화 우려' 복사 문구만 반복되면 통원 한도 적용 유지(백내장 단순 수술은 대법 2022·2023 원칙적 통원)",
  },
  {
    id: "count_over",
    label: "횟수 한도 초과",
    category: "절차적",
    verdict: "다툼가능",
    issue: "치료 필요성",
    clausePoint:
      "약관에 횟수 한도가 '명시'되어 있는지 먼저 확인. 1~2세대는 도수치료 횟수 제한·매회 효과확인 조항이 없는 경우가 많음(미명시면 초과 주장 약함)",
    proArg:
      "전주지법 2022나23007(대법 확정): 1~2세대 약관에 도수치료 횟수 미명시 → 작성자 불이익 원칙으로 100회+ 도수치료도 전액 인정. VAS·ROM 호전 입증이 관건",
    conArg:
      "4세대(2021.7~)는 3대 비급여 특약으로 연 50회 제한 + 10회 단위 호전 확인 요건 → 위 판례 부적용. 효과 없는 유지치료는 정당 면책에 가까움",
  },
  {
    id: "scope",
    label: "가입담보·특약 범위 밖",
    category: "절차적",
    verdict: "다툼가능",
    clausePoint: "가입 당시 약관 원문에서 해당 비급여 보장 특약 가입 여부 확인",
    proArg: "약관 문언이 불명확하면 작성자 불이익 원칙으로 다툴 여지",
    conArg: "특약 미가입이 명확하면 보완 여지가 적어 분쟁조정 결과도 제한적",
  },
  {
    id: "disclosure",
    label: "계약 전 알릴의무(고지의무) 위반",
    category: "절차적",
    verdict: "다툼가능",
    clausePoint:
      "2025 개정 보험업법상 '서면 질문 사항'에 한해 고지의무 성립. 설계사 구두 고지는 수령 권한 없음에 유의",
    proArg:
      "미고지 병력과 현재 청구 질병 간 의학적 인과관계 부존재를 입증하거나, 가입 후 3년 경과 시 상법상 해지·부지급 원칙적 불가",
    conArg:
      "중요 사항을 서면 질문에 부정확히 기재했고 현재 질병과 인과관계가 인정되면 계약 해지·부지급 가능",
  },
  {
    id: "copay",
    label: "본인부담상한액 환급금 불인정(이득금지 원칙)",
    category: "면책",
    verdict: "정당 면책",
    acceptNote:
      "공단이 사후 환급하는 본인부담상한제 초과분은 환자의 실제 손해가 아니어서 보상 대상이 아닙니다. 대법원 2024.1.25. 2023다283913은 1~4세대 가입 시기 불문 동일하게 판단했습니다. 이 항목은 미리 공제하고 기대치를 조정하는 편이 시간·비용을 아낍니다.",
  },
  {
    id: "discount",
    label: "지인할인·의료기관 임의 감면액(이득금지 원칙)",
    category: "면책",
    verdict: "정당 면책",
    acceptNote:
      "실제로 병원에 지급하지 않은 감면액은 실손 보상 대상이 아닙니다(대법원 2024.10.31. 2023다240916, 실제 부담액만 담보). 감면 전 총액으로 청구할 수 없습니다.",
  },
  {
    id: "riskshare",
    label: "제약사 위험분담제 환급금 불인정(이득금지 원칙)",
    category: "면책",
    verdict: "정당 면책",
    acceptNote:
      "고가 약제 투여 후 제약사로부터 사후 환급받는 금액은 최종 손해가 아니어서 보상되지 않습니다. 환급분을 제외한 실제 부담액 기준으로 정리하세요.",
  },
  {
    id: "cosmetic",
    label: "미용 목적",
    category: "면책",
    verdict: "정당 면책",
    acceptNote:
      "미용·외모 개선 목적은 약관상 보장 대상이 아닙니다. 치료 목적이 함께 있었다면 그 부분만 분리 소명할 수 있는지 확인하되, 순수 미용이라면 솔직한 수용이 현명한 선택입니다.",
  },
  {
    id: "arbitrary",
    label: "신의료기술 미통과 임의비급여",
    category: "면책",
    verdict: "정당 면책",
    acceptNote:
      "신의료기술평가를 통과하지 못한 임의비급여는 현 약관상 보장 대상이 아닙니다. 향후 평가 통과·고시 변경 시 달라질 수 있으니 시점을 기록해 두세요.",
  },
  {
    id: "not_treatment",
    label: "치료 목적 비해당(영양·예방·검진 등)",
    category: "면책",
    verdict: "정당 면책",
    acceptNote:
      "예방·영양·건강증진 목적은 '치료'가 아니어서 보장 대상이 아닙니다. 질병 치료 목적이 명확한 부분이 섞여 있다면 그 부분만 구분 청구가 가능한지 확인해 보세요.",
  },
  {
    id: "excess",
    label: "명백한 과잉진료",
    category: "면책",
    verdict: "정당 면책",
    acceptNote:
      "의학적 필요를 넘는 과잉 부분은 보장되지 않습니다. 다만 '필요한 범위'와 '과잉 범위'의 경계가 다툼이 될 수 있으니, 필요 범위에 대한 기록은 따로 확보해 두세요.",
  },
  {
    id: "fraud",
    label: "둔갑치료·허위·과다 반복 정황",
    category: "면책",
    verdict: "사기위험",
  },
];

/** 금감원/약관 인정 횟수 가이드라인 */
export interface Guideline {
  source: string;
  annualMax: number;
  perSiteMax?: number;
  appliesNote?: string;
}

/** 시술·질환 */
export interface Procedure {
  id: string;
  label: string;
  generationNote: string;
  patterns: { 유형: string; 설명: string }[];
  /** 이 시술에서 흔한 거절 사유 id */
  reasonIds: string[];
  /** 인정 횟수 가이드라인(있으면 충족도 스코어링) */
  guideline?: Guideline;
}

export const procedures: Procedure[] = [
  {
    id: "manual",
    label: "도수치료",
    generationNote: "2세대는 비급여 실손 보장 대상. 5세대는 비중증 비급여로 별도 한도·제외 이슈.",
    patterns: [
      { 유형: "절차적", 설명: "횟수 초과(치료 목표 도달 후 유지치료로 간주)" },
      { 유형: "의학적", 설명: "치료효과·인과관계 불충분" },
      { 유형: "의학적", 설명: "의료자문 개입 기반 부지급" },
    ],
    reasonIds: ["advisory", "count_over", "necessity", "causation", "disclosure"],
    guideline: {
      source: "4세대 3대 비급여 특약",
      annualMax: 50,
      appliesNote: "4세대(2021.7~)에 적용. 1~3세대는 도수치료 횟수 제한 조항이 없는 경우가 많음",
    },
  },
  {
    id: "cataract",
    label: "백내장 다초점렌즈",
    generationNote:
      "세대별 통원·입원 한도가 상이. 단순 수술은 대법원상 원칙적 통원이며, 입원 인정 여부가 지급액을 크게 가른다(기저질환 입증이 예외 인정의 열쇠).",
    patterns: [
      { 유형: "절차적", 설명: "입원 불인정(통원 한도 적용)" },
      { 유형: "의학적", 설명: "수술 필요성 불인정" },
    ],
    reasonIds: ["admission", "necessity", "scope", "copay", "discount", "disclosure"],
  },
  {
    id: "cartstem",
    label: "카티스템(무릎 연골 수술)",
    generationNote:
      "메디포스트 동종 제대혈 유래 줄기세포 치료제(2012 허가, 전문의약품·수술). 무릎 줄기세포 '주사'(BMAC)와 별개. 비급여 보장 특약 가입 여부가 핵심.",
    patterns: [
      { 유형: "의학적", 설명: "치료 필요성·당위성 불인정" },
      { 유형: "절차적", 설명: "입원 적정성·비급여 항목 삭감" },
      { 유형: "절차적", 설명: "가입담보·특약 범위 밖" },
    ],
    reasonIds: ["necessity", "admission", "scope", "causation", "discount", "disclosure"],
  },
  {
    id: "bmac",
    label: "무릎 줄기세포 주사(BMAC)",
    generationNote:
      "자가 골수 흡인 농축물 주사. 신의료기술 고시상 K-L 등급 2~3등급 적응증. 시술 후 입원의 실질적 필요성(생체징후 변화·약물 복용력)이 분쟁의 핵심.",
    patterns: [
      { 유형: "의학적", 설명: "적응증(K-L 등급) 미달·초과" },
      { 유형: "절차적", 설명: "입원 적정성 불인정(생체징후 변화 미입증)" },
      { 유형: "의학적", 설명: "의료자문 개입 기반 부지급" },
    ],
    reasonIds: ["admission", "necessity", "advisory", "causation", "disclosure"],
  },
  {
    id: "eswt",
    label: "체외충격파 치료",
    generationNote:
      "도수치료 풍선효과 항목. 금감원 분쟁조정기준: 7개 관절(어깨·팔꿈치·고관절·슬관절·발목·족저근막·척추), 연 최대 12회·부위당 최대 6회.",
    patterns: [
      { 유형: "절차적", 설명: "인정 부위·횟수 초과(연 12회/부위당 6회)" },
      { 유형: "의학적", 설명: "치료 필요성·효과 불인정" },
      { 유형: "의학적", 설명: "의료자문 개입 기반 부지급" },
    ],
    reasonIds: ["count_over", "necessity", "advisory", "causation", "disclosure"],
    guideline: {
      source: "금감원 분쟁조정기준",
      annualMax: 12,
      perSiteMax: 6,
      appliesNote: "7개 관절(어깨·팔꿈치·고관절·슬관절·발목·족저근막·척추) 대상",
    },
  },
  {
    id: "nutrient",
    label: "영양주사",
    generationNote: "치료 목적 입증이 없으면 대부분 보장 제외.",
    patterns: [{ 유형: "면책", 설명: "치료 목적 비해당(예방·건강증진)" }],
    reasonIds: ["not_treatment", "necessity", "disclosure"],
  },
  {
    id: "nosevalve",
    label: "비밸브재건술",
    generationNote: "기능 개선(코막힘) 목적과 미용 목적의 구분이 쟁점.",
    patterns: [
      { 유형: "면책", 설명: "미용 목적 의심" },
      { 유형: "의학적", 설명: "기능적 치료 필요성 불인정" },
    ],
    reasonIds: ["cosmetic", "necessity", "disclosure"],
  },
];

/** physician-evidence-kit: 쟁점별 객관적 기록 */
export const evidenceKit: Record<
  "치료 필요성" | "인과관계" | "입원 실질",
  { docs: string[]; method: string; script: string }
> = {
  "치료 필요성": {
    docs: ["치료기록지", "통증·기능 평가(VAS·ROM 등)", "경과기록", "최초 진단·영상"],
    method: "진료비 세부내역서 발급 + 의무기록 사본 열람·발급 요청",
    script:
      "치료 목적, 치료에 대한 반응, 기능 호전 경과를 회차별로 구체적으로 기재해 주시길 정중히 요청드립니다.",
  },
  인과관계: {
    docs: ["최초 진단서", "검사결과지", "영상 판독지", "경과기록(시계열)"],
    method: "최초 진단 시점부터의 기록 일체를 시계열로 확보",
    script:
      "해당 증상이 보장 대상 질병/상해와 어떻게 연관되는지, 진단 근거와 경과를 기재해 주시길 요청드립니다.",
  },
  "입원 실질": {
    docs: [
      "간호기록지(생체징후·혈압 추이)",
      "약물 복용력·기저질환 기록",
      "경과기록·처치내역",
      "입퇴원요약지",
      "마취·수술기록",
    ],
    method:
      "입퇴원확인서 + 생체징후(혈압 등) 변화와 약물 복용력이 드러나는 간호기록지를 확보. '복사 문구'가 아닌 환자 개별 상태 기재 여부 확인",
    script:
      "입원 기간 중 생체징후 변화, 기저질환·약물 복용에 따른 합병증 우려 등 통원으로 대체 불가했던 관찰·처치의 의학적 필요성을 환자 개별 상태에 맞게 구체적으로 기재해 주시길 정중히 요청드립니다.",
  },
};

/** 의료자문 대응 단계 */
export type AdvisoryStage = "동의 전" | "동의 후";
export type DenialStatus = "심사 중단" | "일부지급" | "부지급";

/** medical-advisory-counter: 단계·상태별 레버 */
export function advisoryLevers(
  stage: AdvisoryStage,
  status: DenialStatus
): { levers: string[]; caution: string } {
  const caution =
    "의료자문 동의는 법적 의무가 아닌 협조 요청입니다(거부 가능). 다만 제도·기준은 변동되므로 최신 기준을 확인하고, 정당한 자문까지 무력화하려는 접근은 권하지 않습니다.";
  if (stage === "동의 전") {
    return {
      levers: [
        "의료자문 동의 거부 의사를 명확히 표시(기존 진료기록만으로 판단 가능함을 명시)",
        "자문 의뢰 사유·근거를 서면으로 요청",
        "주치의 소견서를 선제출",
        "보험사가 자문 없이는 심사 불가라고 압박하면 '동시감정'(중립 대학병원 전문의 공동 선정, 비용 보험사 부담)을 요구",
        "무기한 심사 중단의 부당성을 기록으로 남김",
      ],
      caution,
    };
  }
  // 동의 후
  return {
    levers: [
      "자문 결과의 근거·전문과목 확인 요청",
      "자문의 선정·익명·비용 부담 구조에 대한 이의 제기",
      "중립 대학병원 전문의 공동 선정(동시감정·비용 보험사 부담)으로 재감정 요구",
      status === "부지급"
        ? "합의된 제3 의사 재감정 요구"
        : "추가 자문/재감정으로 일부지급 범위 재산정 요청",
      "미해결 시 금융감독원 분쟁조정 신청",
    ],
    caution,
  };
}

// ---------------------------------------------------------------------------
// 카드 생성 엔진 (casebook-card-formatter 양식)
// ---------------------------------------------------------------------------

export interface CardInput {
  procedureId: string;
  generationId: string;
  reasonIds: string[];
  advisoryStage?: AdvisoryStage;
  denialStatus?: DenialStatus;
  /** 가이드라인 충족도 결과(있으면 카드에 반영) */
  guideline?: { status: "충족" | "초과"; messages: string[] };
}

export interface CasebookCard {
  title: string;
  verdict: Verdict;
  denialReasons: string[];
  /** 사기위험 경고 */
  warning?: string;
  /** 다툼가능 반박 요지 */
  rebuttal?: { issues: string[]; clausePoints: string[]; proArgs: string[]; conArgs: string[] };
  /** 의료자문 대응 */
  advisory?: { levers: string[]; caution: string };
  /** 진료의 증빙 */
  evidence?: { issue: string; docs: string[]; method: string; script: string }[];
  /** 환자 행동 단계 */
  actions: string[];
  /** 이의신청 초안 골격(요약) */
  appealDraft?: string[];
  /** 이의신청서 전문(슬롯필링 서식, 본인 제출용) */
  appealLetter?: string;
  /** 가이드라인 충족도 */
  guidelineNote?: { status: "충족" | "초과"; messages: string[] };
  /** 구제 채널 안내(근거 통계) */
  channelNote?: string;
  /** 마음 정리 / 수용 안내 */
  closing: string;
  disclaimer: string;
}

const DISCLAIMER =
  "참고용 초안 · 전문가 확인 권장. 본 카드는 법률·보험 자문이 아니며 사안별로 결론이 달라질 수 있습니다. 무료 채널(보험사 재심사 → 금융감독원 분쟁조정)을 우선 고려하세요.";

/** legitimacy-gate: 선택된 사유들로 최종 판정 (사기위험 > 다툼가능 > 정당면책) */
export function resolveVerdict(reasons: DenialReason[]): Verdict {
  if (reasons.some((r) => r.verdict === "사기위험")) return "사기위험";
  if (reasons.some((r) => r.verdict === "다툼가능")) return "다툼가능";
  return "정당 면책";
}

/**
 * 이의신청서 전문(슬롯필링 서식)을 결정론적으로 조립한다.
 * 전문가가 사전 검수한 고정 문안 + 사용자 빈칸(________) 구조로,
 * 생성형 AI의 자유 창작이 아닌 규칙 기반 슬롯필링이다(2026 대법원 로폼 판결상 적법).
 */
function buildAppealLetter(p: {
  procLabel: string;
  genLabel: string;
  denialReasonLabels: string[];
  reasonGrounds: { label: string; clausePoint?: string; proArg?: string }[];
  docs: string[];
  hasAdvisory: boolean;
}): string {
  const today = new Date().toISOString().slice(0, 10);
  const grounds = p.reasonGrounds
    .map(
      (g, i) =>
        `   ${i + 1}) ${g.label}\n` +
        (g.clausePoint ? `      - 약관 검토: ${g.clausePoint}\n` : "") +
        (g.proArg ? `      - 반박 근거: ${g.proArg}\n` : "")
    )
    .join("");
  const docsList = p.docs.map((d) => `   - ${d}`).join("\n");
  const advisoryClause = p.hasAdvisory
    ? "\n4. 의료자문 관련 요청\n" +
      "   의료자문은 법적 의무가 아닌 협조 요청이며, 자문 결과만으로 한 부지급에 동의할 수 없습니다.\n" +
      "   필요 시 보험회사·계약자·제3의 의사가 합의하여 선정하는 '동시감정'(비용 보험회사 부담)을 요구합니다.\n"
    : "";
  const advisoryAlt = p.hasAdvisory ? " / (불가 시) 합의된 제3 의사 재감정 또는 금융감독원 분쟁조정" : " / (불가 시) 금융감독원 분쟁조정";

  return `[실손의료보험금 부지급 결정에 대한 이의신청서]

수신: ________ 보험(주) 보상담당자 귀중
발신: 성명 ________ (생년월일 ________ / 연락처 ________)
증권번호: ________
진료(사고) 내역: ${p.procLabel} (${p.genLabel}) / 진료기간 ________ / 진료기관 ________
청구일: ________ / 부지급 통보일: ________

1. 부지급 결정 내용
   귀사는 위 청구 건에 대하여 아래 사유로 보험금 지급을 거절하였습니다.
   - ${p.denialReasonLabels.join("\n   - ")}

2. 이의 사유
   본인은 다음 근거로 위 결정에 이의를 제기합니다.
${grounds}
3. 입증 자료(첨부)
${docsList}
   - 주치의 소견서(거절 사유를 반박하는 상세 소견)
${advisoryClause}
${p.hasAdvisory ? "5" : "4"}. 요청 사항
   - 위 자료를 토대로 재심사하여 부지급분 ________원을 지급하여 주시기 바랍니다.
   - 본 이의신청에 대한 처리 결과를 서면으로 회신하여 주시기 바랍니다.${advisoryAlt}

${today}
신청인: ________ (서명 또는 날인)

※ 본 문서는 신청인 본인이 작성·제출하는 참고용 초안입니다. 전문가 확인을 권장합니다.`;
}

export function buildCard(input: CardInput): CasebookCard {
  const proc = procedures.find((p) => p.id === input.procedureId)!;
  const gen = generations.find((g) => g.id === input.generationId)!;
  const reasons = denialReasons.filter((r) => input.reasonIds.includes(r.id));
  const verdict = resolveVerdict(reasons);
  const title = `${proc.label} / ${gen.label} 실손`;
  const denialReasonLabels = reasons.map((r) => r.label);

  // 사기위험 → 진행 보류·경고
  if (verdict === "사기위험") {
    return {
      title,
      verdict,
      denialReasons: denialReasonLabels,
      warning:
        "허위·둔갑·과다 반복 정황이 의심됩니다. 반박 논리를 진행하지 않습니다. 사실관계를 먼저 정리하고, 정당한 청구만 진행하세요. 거짓 청구는 형사·민사 책임으로 이어질 수 있습니다.",
      actions: [
        "진료·청구 사실관계를 객관적 기록으로 재확인",
        "사실과 다른 부분이 있으면 정정·철회",
        "정당한 부분만 분리해 정식 청구",
      ],
      closing:
        "정당한 거절을 다투지 않는 것도 좋은 결과입니다. 무리한 청구는 더 큰 피해로 돌아옵니다.",
      disclaimer: DISCLAIMER,
    };
  }

  // 정당 면책 → 반박 생략, 수용 안내
  if (verdict === "정당 면책") {
    const acceptNotes = reasons
      .map((r) => r.acceptNote)
      .filter((x): x is string => Boolean(x));
    return {
      title,
      verdict,
      denialReasons: denialReasonLabels,
      actions: [
        "약관 원문에서 해당 면책 조항을 직접 확인",
        "치료 목적이 일부라도 섞여 있는지 점검(있으면 그 부분만 분리 소명)",
        "다툼 여지가 없으면 품위 있게 수용",
      ],
      closing:
        acceptNotes.join("\n\n") ||
        "현 약관상 보장 대상이 아닙니다. 솔직히 수용하는 것이 2차 피해를 막는 길입니다.",
      disclaimer: DISCLAIMER,
    };
  }

  // 다툼가능 → 반박 + (자문대응) + 증빙 + 이의신청 골격
  const disputable = reasons.filter((r) => r.verdict === "다툼가능");
  const issues = Array.from(
    new Set(disputable.map((r) => r.issue).filter((x): x is NonNullable<typeof x> => Boolean(x)))
  );

  const rebuttal = {
    issues,
    clausePoints: disputable.map((r) => r.clausePoint).filter((x): x is string => Boolean(x)),
    proArgs: disputable.map((r) => r.proArg).filter((x): x is string => Boolean(x)),
    conArgs: disputable.map((r) => r.conArg).filter((x): x is string => Boolean(x)),
  };

  const hasAdvisory = disputable.some((r) => r.involvesAdvisory);
  const advisory = hasAdvisory
    ? advisoryLevers(input.advisoryStage ?? "동의 후", input.denialStatus ?? "부지급")
    : undefined;

  const evidence = issues.map((issue) => ({ issue, ...evidenceKit[issue] }));

  const appealDraft = [
    "청구인 ________ / 증권번호 ________ / 청구일 ________",
    `거절 통보 요약: ${denialReasonLabels.join(", ")}`,
    `이의 사유: ${rebuttal.clausePoints.join(" / ") || "약관·기록 근거"}`,
    `첨부: ${evidence.flatMap((e) => e.docs).join(", ")}${hasAdvisory ? ", 주치의 소견서" : ""}`,
    "요청사항: 재심사 및 부지급분 ________ 지급" +
      (hasAdvisory ? " / (불가 시) 합의된 제3 의사 재감정" : ""),
  ];

  const appealLetter = buildAppealLetter({
    procLabel: proc.label,
    genLabel: gen.label,
    denialReasonLabels,
    reasonGrounds: disputable.map((r) => ({
      label: r.label,
      clausePoint: r.clausePoint,
      proArg: r.proArg,
    })),
    docs: Array.from(new Set(evidence.flatMap((e) => e.docs))),
    hasAdvisory,
  });

  return {
    title,
    verdict,
    denialReasons: denialReasonLabels,
    rebuttal,
    advisory,
    evidence,
    actions: [
      "의무기록·진료비 세부내역 확보 + 주치의 소견서 요청",
      "보험사에 거절 근거 서면 요청 + 재심사 청구",
      "미해결 시 금융감독원 분쟁조정 신청",
    ],
    appealDraft,
    appealLetter,
    guidelineNote: input.guideline,
    channelNote:
      "민사 소송은 패소 시 상대방 변호사보수·감정료까지 부담(민소법 제98조)하고 소비자 승소율이 낮아 최후 수단으로 둡니다. 대신 금융감독원 분쟁조정을 1순위로 활용하세요 — 제3보험(실손) 인용률이 2023상 18.3% → 2024상 26.9% → 2025상 40.3%로 상승했고, 신청만으로 소멸시효가 중단되며 수락 시 재판상 화해와 동일한 효력을 가집니다.",
    closing:
      "진료한 의사의 객관적 기록이 가장 강한 증거입니다. 절차를 하나씩 밟는 것 자체가 정당한 대응입니다. 결과는 누구도 약속할 수 없지만, 근거를 갖추는 일은 온전히 당신이 할 수 있습니다.",
    disclaimer: DISCLAIMER,
  };
}

// ---------------------------------------------------------------------------
// 통계·소송비용 (research-실손거절-대응.md 근거). 단정 금지: '현상'으로만 표기.
// ---------------------------------------------------------------------------

/** 거절 사유별 비중 (한국소비자원, 2021.1~2024.9, n=1,016) */
export const denialStats = [
  { label: "치료 필요 불인정", share: 44.6 },
  { label: "입원 필요 불인정", share: 22.7 },
  { label: "본인부담상한액 환급금 불인정", share: 10.3 },
  { label: "기타(고지의무·면책조항 등)", share: 22.4 },
];

/** 구제 단계별 인용/승소율 (금감원·국감 자료) */
export const resolutionStats = [
  { stage: "한국소비자원 합의율(손보 평균)", rate: "28.3%", note: "난건 위주 후단 사례(착시)" },
  { stage: "금감원 실손 인용률 2023상", rate: "18.3%", note: "" },
  { stage: "금감원 실손 인용률 2024상", rate: "26.9%", note: "" },
  { stage: "금감원 실손 인용률 2025상", rate: "40.3%", note: "비급여 가이드라인 확립" },
  { stage: "민사소송 소비자 승소율(생보)", rate: "<17%", note: "보험사 체리피킹" },
];

/** 민사소송 패소 시 상대방 변호사보수 산입 상한(소가 기준, 대법원규칙) */
export function litigationFeeCap(소가: number): number {
  if (소가 <= 3_000_000) return 300_000;
  if (소가 <= 20_000_000) return 300_000 + (소가 - 3_000_000) * 0.1;
  if (소가 <= 50_000_000) return 2_000_000 + (소가 - 20_000_000) * 0.08;
  if (소가 <= 100_000_000) return 4_400_000 + (소가 - 50_000_000) * 0.06;
  return 7_400_000 + (소가 - 100_000_000) * 0.04;
}

/** 피해구제 신청자 연령 분포 (한국소비자원) */
export const claimantAgeStats = [
  { label: "40대", share: 22.0 },
  { label: "50대", share: 29.1 },
  { label: "60대", share: 23.3 },
  { label: "기타 연령", share: 25.6 },
];

/**
 * 변호사법 준수 고지 (2026.2 대법원 로폼 판결 기준).
 * 본 앱은 규칙 기반 슬롯필링 보조 도구이며, 생성형 AI의 법률 추론·창작을 배제한다.
 */
export const COMPLIANCE_NOTICE =
  "본 도구는 전문가가 사전 검수한 규칙 기반 서식에 사용자가 사실관계를 채워 넣는 '문서 작성 보조 도구'입니다(2026.2 대법원 로폼 판결상 적법한 슬롯필링 구조). 변호사법 준수를 위해 ① 보험금 청구를 대리하지 않고 ② 성공보수·수수료를 받지 않으며 ③ 완성된 초안은 사용자 본인이 직접 본인 명의로 보험사·금융감독원에 제출합니다. 생성형 AI가 맥락을 자의적으로 판단해 법률문서를 창작하지 않습니다.";

/** 금감원 가이드라인 충족도 스코어링 */
export function checkGuideline(
  g: Guideline,
  annualCount: number,
  perSiteCount?: number
): { status: "충족" | "초과"; messages: string[] } {
  const messages: string[] = [];
  let exceeded = false;
  if (annualCount > g.annualMax) {
    exceeded = true;
    messages.push(`연간 ${annualCount}회 > 인정 한도 ${g.annualMax}회 (초과분은 소명 필요)`);
  } else {
    messages.push(`연간 ${annualCount}회 ≤ 인정 한도 ${g.annualMax}회 (가이드라인 충족)`);
  }
  if (g.perSiteMax !== undefined && perSiteCount !== undefined) {
    if (perSiteCount > g.perSiteMax) {
      exceeded = true;
      messages.push(`부위당 ${perSiteCount}회 > 한도 ${g.perSiteMax}회 (초과분은 소명 필요)`);
    } else {
      messages.push(`부위당 ${perSiteCount}회 ≤ 한도 ${g.perSiteMax}회 (충족)`);
    }
  }
  return { status: exceeded ? "초과" : "충족", messages };
}
