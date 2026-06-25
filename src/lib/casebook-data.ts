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
    proArg: "치료 목적·반응·기능 호전을 객관적 기록으로 소명하면 조정 인정 여지",
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
    clausePoint: "입원·통원 정의 조항. 입원 실질은 증상·진단·치료를 종합 판단",
    proArg: "관찰·처치의 의학적 필요성이 기록으로 확인되면 입원 실질 인정 여지",
    conArg: "단순 편의·경과관찰 성격이 강하면 통원 한도 적용이 유지될 수 있음",
  },
  {
    id: "count_over",
    label: "횟수 한도 초과",
    category: "절차적",
    verdict: "다툼가능",
    issue: "치료 필요성",
    clausePoint: "약관에 횟수 한도가 '명시'되어 있는지 먼저 확인(미명시면 초과 주장 약함)",
    proArg: "인과관계·치료효과를 소명하면 한도 외 회차도 조정 인정 사례군 존재",
    conArg: "약관에 횟수가 명시되어 있고 효과 없는 유지치료라면 정당 면책에 가까움",
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

/** 시술·질환 */
export interface Procedure {
  id: string;
  label: string;
  generationNote: string;
  patterns: { 유형: string; 설명: string }[];
  /** 이 시술에서 흔한 거절 사유 id */
  reasonIds: string[];
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
    reasonIds: ["advisory", "count_over", "necessity", "causation"],
  },
  {
    id: "cataract",
    label: "백내장 다초점렌즈",
    generationNote: "세대별 통원·입원 한도가 상이. 입원 인정 여부가 지급액을 크게 가른다.",
    patterns: [
      { 유형: "절차적", 설명: "입원 불인정(통원 한도 적용)" },
      { 유형: "의학적", 설명: "수술 필요성 불인정" },
    ],
    reasonIds: ["admission", "necessity", "scope"],
  },
  {
    id: "cartstem",
    label: "카티스템(무릎 연골)",
    generationNote: "비급여 수술·약제·재료 항목. 세대별 비급여 보장 특약 가입 여부가 핵심.",
    patterns: [
      { 유형: "의학적", 설명: "치료 필요성·당위성 불인정" },
      { 유형: "절차적", 설명: "입원 적정성·비급여 항목 삭감" },
      { 유형: "절차적", 설명: "가입담보·특약 범위 밖" },
    ],
    reasonIds: ["necessity", "admission", "scope", "causation"],
  },
  {
    id: "nutrient",
    label: "영양주사",
    generationNote: "치료 목적 입증이 없으면 대부분 보장 제외.",
    patterns: [{ 유형: "면책", 설명: "치료 목적 비해당(예방·건강증진)" }],
    reasonIds: ["not_treatment", "necessity"],
  },
  {
    id: "nosevalve",
    label: "비밸브재건술",
    generationNote: "기능 개선(코막힘) 목적과 미용 목적의 구분이 쟁점.",
    patterns: [
      { 유형: "면책", 설명: "미용 목적 의심" },
      { 유형: "의학적", 설명: "기능적 치료 필요성 불인정" },
    ],
    reasonIds: ["cosmetic", "necessity"],
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
    docs: ["입원기록", "경과기록", "처치내역", "마취·수술기록"],
    method: "입퇴원확인서 + 처치·관찰 내역이 드러나는 의무기록 확보",
    script:
      "입원 기간 중 관찰·처치의 의학적 필요성(통원으로 대체 불가했던 사유)을 구체적으로 기재해 주시길 요청드립니다.",
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
    "의료자문 제도·기준은 변동되므로 진행 전 최신 기준을 확인하세요. 정당한 자문까지 무력화하려는 접근은 권하지 않습니다.";
  if (stage === "동의 전") {
    return {
      levers: [
        "자문 의뢰 사유·근거를 서면으로 요청",
        "주치의 소견서를 선제출",
        "동의 여부는 신중히 결정(무기한 심사 중단의 부당성을 기록으로 남김)",
      ],
      caution,
    };
  }
  // 동의 후
  return {
    levers: [
      "자문 결과의 근거·전문과목 확인 요청",
      "자문의 선정·익명·비용 부담 구조에 대한 이의 제기",
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
  /** 이의신청 초안 골격 */
  appealDraft?: string[];
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
    closing:
      "진료한 의사의 객관적 기록이 가장 강한 증거입니다. 절차를 하나씩 밟는 것 자체가 정당한 대응입니다. 결과는 누구도 약속할 수 없지만, 근거를 갖추는 일은 온전히 당신이 할 수 있습니다.",
    disclaimer: DISCLAIMER,
  };
}
