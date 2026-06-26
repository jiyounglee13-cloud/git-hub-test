// ---------------------------------------------------------------------------
// 한국형 FHI 3단계 프롬프트 아키텍처 (docs/research-fhi-프롬프트-설계.md 근거)
//
// 북극성: 변호사법 제109조 준수 — 생성형 AI의 자유 법률 창작 배제,
// 규칙 기반 슬롯필링 보조 도구로서의 역할만 수행 (2026.2 대법원 로폼 판결 기준).
// ---------------------------------------------------------------------------

// ---------------------------------------------------------------------------
// 단계 1: 시스템 롤 & 경계 설정 (Meta & System Prompt)
// ---------------------------------------------------------------------------

/** 서비스 페르소나 정의 — 변호사법 준수를 위해 AI 자아를 '문서 서식 보조 도구'로 제한 */
export const SYSTEM_PERSONA = `당신은 한국의 실손의료보험 가입자가 정당한 치료 후 보험금 지급을 거절당했을 때, 사용자가 제공한 사실관계와 거절 통지서 내용을 바탕으로 이의신청서 초안 구성을 돕는 비영리 '의료·행정 문서 서식 작성 보조 도구'입니다.` as const;

/** 절대 금지 행위 목록 — 네거티브 프롬프팅 */
export const HARD_CONSTRAINTS = [
  "독자적인 법적 판단 또는 법률 자문 제공",
  "승소 확률·가능성 수치 예측",
  "RAG 파이프라인에 없는 허구의 판례·약관·법리 창작(Hallucination)",
  "의학적 진단 또는 처방 행위",
  "사용자를 대리하여 문서 제출",
  "성공보수·수수료 수취를 전제한 서비스 제공",
] as const;

/** 면책 고지 — 최종 출력물 하단에 반드시 삽입 */
export const OUTPUT_DISCLAIMER =
  "본 문서는 사용자의 입력을 바탕으로 공인된 판례 데이터를 기계적으로 매핑하여 생성된 서식 초안일 뿐, 법률적 또는 의학적 자문이 아닙니다. 제출 전 본인의 의무기록과 사실관계가 일치하는지 반드시 직접 확인하시기 바랍니다.";

/** 4단 서식 구조 */
export const DOCUMENT_STRUCTURE = [
  "문서 번호 / 제목",
  "청구 개요 및 경과",
  "부지급 처분의 부당성 및 관련 근거",
  "향후 조치 및 요구사항",
] as const;

// ---------------------------------------------------------------------------
// 단계 2: 맥락 주입 블록 — RAG 지식 베이스 (Context Injection)
//
// 벡터 데이터베이스에서 Cosine Similarity 기준으로 검색된 판례를 주입한다.
// 각 항목은 해당 시술·거절 사유와 연동되어 동적으로 선택된다.
// ---------------------------------------------------------------------------

export interface RagPrecedent {
  /** 판례·결정문 식별자 */
  id: string;
  /** 사건명 or 분쟁조정 번호 */
  citation: string;
  /** 선고·결정일 */
  date: string;
  /** 관련 시술 id (casebook-data.ts procedures 참조) */
  procedureIds: string[];
  /** 관련 거절 사유 id (casebook-data.ts denialReasons 참조) */
  denialReasonIds: string[];
  /** 핵심 판시사항 — RAG 주입 텍스트 */
  holding: string;
  /** 승패 분기 요인 */
  keyFactor: string;
  /** 소비자 유리 여부 */
  favorConsumer: boolean;
}

export const ragPrecedents: RagPrecedent[] = [
  // 백내장 — 대법원 원칙: 통원
  {
    id: "sc-2024da305643",
    citation: "대법원 2025.1.23. 2024다305643",
    date: "2025-01-23",
    procedureIds: ["cataract"],
    denialReasonIds: ["admission"],
    holding:
      "백내장 수술의 입원 인정 여부는 6시간 체류라는 형식 요건이 아닌 '지속적 의학적 관찰이 필요한 실질적 상태'인지를 기준으로 판단한다. 단순 수술은 원칙적으로 통원에 해당한다.",
    keyFactor: "6시간 체류 단독 → 통원. 기저질환+의사 개별 판단 → 입원 가능.",
    favorConsumer: false,
  },
  // 백내장 — 광주지법: 기저질환+개별 입원 지시 → 예외 인정
  {
    id: "gwangju-2026-cataract",
    citation: "광주지방법원 2026 항소심 (홍채섬모체염 기저질환)",
    date: "2026-01-01",
    procedureIds: ["cataract"],
    denialReasonIds: ["admission"],
    holding:
      "수술 이전부터 홍채섬모체염 기저질환을 앓고 있었고, 이로 인해 의사의 전문적 의학적 판단에 따라 합병증 방지 목적의 입원이 이루어진 경우, 입원 치료의 필요성이 인정된다(630만원 지급).",
    keyFactor: "홍채섬모체염 기저질환 기록 + 주치의 개별 입원 지시 사유 명시",
    favorConsumer: true,
  },
  // 도수치료 — 1~2세대 약관 명시성 없음 → 작성자 불이익
  {
    id: "jeonju-2022na23007",
    citation: "전주지방법원 2022나23007 (대법원 확정)",
    date: "2022-01-01",
    procedureIds: ["manual"],
    denialReasonIds: ["count_over", "necessity"],
    holding:
      "1~2세대 실손 약관에 도수치료 횟수 제한 조항이나 매회 치료 효과 확인 요건이 명시되어 있지 않은 경우, 작성자 불이익의 원칙을 적용하여 1년간 100회 이상의 도수치료도 전액 인정한다(3,103,300원). 담당 의사가 경추간판장애 등 방사선학적 객관적 진단을 내리고 VAS·ROM 호전이 입증된 경우, 환자를 직접 대면하지 않은 보험사 측 서면 의료자문만으로 과잉진료를 단정할 수 없다.",
    keyFactor: "약관의 횟수 제한 조항 명시 여부 + VAS·ROM 호전 기록",
    favorConsumer: true,
  },
  // BMAC — 서울중앙: 생체징후 변화 2명만 인정
  {
    id: "scourt-2024gadan55065",
    citation: "서울중앙지방법원 2024가단55065 (2026.1. 확정)",
    date: "2026-01-01",
    procedureIds: ["bmac"],
    denialReasonIds: ["admission", "necessity"],
    holding:
      "9명의 BMAC 시술 환자 중 2명만 입원 필요성 인정. 기각(7명): 진료기록에 '증세 악화 우려'라는 천편일률적 문구 반복, 시술 1시간 내외·사후처치 없음. 인정(2명): ① 고혈압+아스피린 장기복용으로 인한 출혈위험 관찰 필요가 의무기록에 명확히 기재, ② 시술 직후 혈압 162/100mmHg 급상승 등 생체징후(Vital Sign)의 급격한 변화가 간호기록지에 객관적으로 입증.",
    keyFactor: "간호기록지의 구체적 생체징후 수치 + 기저질환·상용약물 기록 여부",
    favorConsumer: true,
  },
  // 주치의 임상 판단 우선 원칙
  {
    id: "sc-2021da234368",
    citation: "대법원 2021다234368",
    date: "2021-01-01",
    procedureIds: ["manual", "bmac", "cataract", "eswt"],
    denialReasonIds: ["advisory", "necessity"],
    holding:
      "주치의의 임상적 판단은 특별히 부당하다고 볼 객관적 사정이 없는 한 존중되어야 한다. 환자를 직접 대면하지 않은 보험사 측의 사후적 서면 의료자문 결과만으로는 주치의의 치료 판단을 번복할 수 없다.",
    keyFactor: "주치의 직접 대면 진단 기록 vs 보험사 서면 자문",
    favorConsumer: true,
  },
  // 이득금지: 본인부담상한제 환급금
  {
    id: "sc-2023da283913",
    citation: "대법원 2024.1.25. 2023다283913",
    date: "2024-01-25",
    procedureIds: [],
    denialReasonIds: ["copay"],
    holding:
      "본인부담상한제에 따라 국민건강보험공단으로부터 사후에 환급받는 금액은 최종적으로 공단이 부담한 비용이므로, 이득금지 원칙에 따라 실손보험에서 이중으로 청구할 수 없다. 1~4세대 가입 시기 불문 동일하게 적용된다.",
    keyFactor: "본인부담상한제 환급금 수령 여부",
    favorConsumer: false,
  },
  // 이득금지: 지인·직원 할인
  {
    id: "sc-2023da240916",
    citation: "대법원 2024.10.31. 2023다240916",
    date: "2024-10-31",
    procedureIds: [],
    denialReasonIds: ["discount"],
    holding:
      "의료기관과의 계약으로 할인받은 금액은 피보험자가 실제로 부담하는 비용이 아니므로 실손보험의 보상 대상에서 제외된다. 감면 전 총액으로 청구할 수 없다.",
    keyFactor: "실제 납부 금액과 감면 전 금액의 차이",
    favorConsumer: false,
  },
];

// ---------------------------------------------------------------------------
// 단계 3: 작업 지시 블록 — Chain-of-Thought (CoT) 추론 지시
// ---------------------------------------------------------------------------

/** CoT Step 정의 */
export interface CotStep {
  step: number;
  name: string;
  instruction: string;
}

export const chainOfThoughtSteps: CotStep[] = [
  {
    step: 1,
    name: "논리 매핑 (Logic Mapping)",
    instruction:
      "사용자의 상황(기저질환, 생체징후, 약관 세대, 거절 사유)과 보험사의 거절 논리가 RAG로 제공된 판례와 어떻게 부합하거나 배치되는지 내부적으로 교차 검증한다. 가드레일 키워드(지인할인, 본인부담상한제 환급금 등)가 감지되면 즉시 배제 안내로 전환한다.",
  },
  {
    step: 2,
    name: "초안 병합 (Draft Merge)",
    instruction:
      "교차 검증이 완료되면, 사용자의 사실관계 데이터를 표준 4단 서식의 빈칸에 매핑하여 이의신청서 초안을 작성한다. 주치의의 임상적 판단이 우선되어야 함을 부각하고, 거절 사유에 '의료자문'이 언급되어 있다면 '일방적 서면 자문을 거부하며, 제3의 종합병원에서 동시감정을 진행할 것을 요구한다'는 문구를 반드시 추가한다.",
  },
  {
    step: 3,
    name: "안전장치 추가 (Safety Guard)",
    instruction: `출력되는 최종 이의신청서 하단에 다음의 면책 고지를 굵은 글씨로 추가한다: "${OUTPUT_DISCLAIMER}"`,
  },
];

// ---------------------------------------------------------------------------
// 가드레일: 배제 대상 탐지 키워드 → 즉시 차단 (Guardrail)
// ---------------------------------------------------------------------------

export interface GuardrailRule {
  /** 탐지 키워드 패턴 */
  keywords: string[];
  /** 차단 이유 및 관련 판례 */
  reason: string;
  /** 사용자에게 표시할 안내 메시지 */
  userMessage: string;
}

export const guardrailRules: GuardrailRule[] = [
  {
    keywords: ["지인 할인", "병원 직원 할인", "지인할인", "임직원 할인", "지인특혜", "친인척 할인"],
    reason: "대법원 2024.10.31. 2023다240916: 실제 부담액만 담보, 감면분은 실손 보상 대상 외",
    userMessage:
      "지인·직원 할인으로 감면받은 금액은 실제로 부담하지 않은 비용이므로, 대법원 판례(2023다240916)에 의해 실손보험 보상 대상에서 제외됩니다. 실제로 납부하신 금액에 대해서만 청구가 가능합니다.",
  },
  {
    keywords: ["본인부담상한제", "상한제 환급", "공단 환급", "건보 환급"],
    reason: "대법원 2024.1.25. 2023다283913: 공단이 최종 부담한 비용은 이득금지 원칙상 이중 청구 불가",
    userMessage:
      "국민건강보험공단에서 본인부담상한제에 따라 환급받으신 금액은 최종적으로 공단이 부담한 비용입니다. 대법원 판례(2023다283913)에 의해 가입 세대를 불문하고 실손보험에서 이중으로 청구하실 수 없습니다.",
  },
  {
    keywords: ["위험분담제", "제약사 환급", "RSA 환급"],
    reason: "이득금지 원칙: 최종 환자 손해가 아닌 금액은 실손 보상 대상 외",
    userMessage:
      "위험분담제(RSA)에 따라 제약사로부터 환급받은 금액은 환자의 최종 손해에 해당하지 않아 실손보험 보상 대상에서 제외됩니다.",
  },
];

/** 사용자 입력 텍스트에서 가드레일 규칙을 탐지한다 */
export function detectGuardrail(userInput: string): GuardrailRule | null {
  for (const rule of guardrailRules) {
    if (rule.keywords.some((kw) => userInput.includes(kw))) {
      return rule;
    }
  }
  return null;
}

// ---------------------------------------------------------------------------
// 의료자문 방어 로직 — 거절 통지서에서 '의료자문' 키워드 감지 시 자동 삽입
// ---------------------------------------------------------------------------

export const ADVISORY_DEFENSE_KEYWORDS = [
  "의료자문",
  "자문 결과",
  "제3의 의료기관",
  "서면 심사",
  "외부 자문",
];

/** 거절 통지서에서 의료자문 개입 여부를 탐지한다 */
export function detectAdvisoryInvolvement(denialNoticeText: string): boolean {
  return ADVISORY_DEFENSE_KEYWORDS.some((kw) => denialNoticeText.includes(kw));
}

/** 의료자문 개입 시 이의신청서에 삽입할 동시감정 요청 문구 */
export const SIMULTANEOUS_APPRAISAL_CLAUSE =
  "귀사의 일방적인 서면 의료자문 결과는 환자를 직접 대면한 주치의의 임상적 소견을 우선할 수 없습니다(대법원 2021다234368). 본인은 의료자문 동의를 거부하며, 분쟁이 지속될 경우 귀사와 본인이 합의한 제3의 대학병원 전문의를 공동 선정하여 동시감정을 진행할 것을 요청합니다. 동시감정 비용은 약관 제19조에 의거하여 귀사가 전액 부담하여야 합니다.";

// ---------------------------------------------------------------------------
// RAG 판례 조회 — 시술 id + 거절 사유 id 기반 관련 판례 필터링
// ---------------------------------------------------------------------------

/** 시술 및 거절 사유 기반으로 관련 RAG 판례를 검색한다 */
export function queryRagPrecedents(
  procedureId: string,
  denialReasonIds: string[]
): RagPrecedent[] {
  return ragPrecedents.filter(
    (p) =>
      (p.procedureIds.length === 0 || p.procedureIds.includes(procedureId)) &&
      (p.denialReasonIds.length === 0 ||
        p.denialReasonIds.some((id) => denialReasonIds.includes(id)))
  );
}

/** 소비자에게 유리한 판례만 추출 */
export function getFavorablePrecedents(
  procedureId: string,
  denialReasonIds: string[]
): RagPrecedent[] {
  return queryRagPrecedents(procedureId, denialReasonIds).filter((p) => p.favorConsumer);
}

/** 소비자에게 불리한(면책 확정) 판례 추출 — 가드레일 표시용 */
export function getAdversePrecedents(
  procedureId: string,
  denialReasonIds: string[]
): RagPrecedent[] {
  return queryRagPrecedents(procedureId, denialReasonIds).filter((p) => !p.favorConsumer);
}
