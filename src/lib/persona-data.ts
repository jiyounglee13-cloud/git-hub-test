// ─────────────────────────────────────────────────────────────────────────────
// CARTSTEM (카티스템) Consultation Briefing – Persona System v1.11
// ─────────────────────────────────────────────────────────────────────────────

// ── Forbidden Words ─────────────────────────────────────────────────────────
export const FORBIDDEN_WORDS: readonly string[] = [
  '완치',
  '재생됩니다',
  '100%',
  '안전합니다',
  '보험 다 됩니다',
  '지금 안 하면',
  '다시 뛸 수 있습니다',
] as const;

export const FORBIDDEN_WORD_CATEGORIES = {
  단정형: ['재생됩니다'],
  무조건형: ['안전합니다', '100%'],
  보험보장형: ['보험 다 됩니다'],
  공포조장형: ['지금 안 하면'],
  복귀보장형: ['다시 뛸 수 있습니다'],
  과장형: ['완치'],
} as const;

// ── Enums / Literal Types ───────────────────────────────────────────────────

export type AgeGroup = '30대이하' | '40대' | '50대' | '60대' | '70대이상';
export type Gender = '남' | '여' | '미응답';

export type InjuryCause =
  | '갑작스러운 부상'
  | '운동 즐겨왔는데 악화'
  | '일·가사로 무릎 많이 써서'
  | '특별한 계기없이 서서히'
  | '모름';

export type PainDuration = '6개월미만' | '6개월~2년' | '2년이상';

export type ActivityHistory =
  | '평생좌식'
  | '일상활동수준'
  | '과거활동적지금제한'
  | '현재규칙적운동'
  | '고강도스포츠';

export type TreatmentGoal =
  | '통증완화'
  | '운동취미복귀'
  | '인공관절지연회피'
  | '직업가사복귀'
  | '일상독립성유지';

export type InsuranceGeneration =
  | '1~2세대'
  | '3세대'
  | '4세대'
  | '5세대'
  | '없음모름';

export type DecisionStage =
  | '첫탐색'
  | '타치료비교중'
  | '거의결정실무확인';

export type Companion = '본인단독' | '배우자' | '자녀' | '기타';

export type InfoLevel =
  | '거의모름'
  | '검색다수용어익숙'
  | '타병원상담경험';

export type PrimaryConcern =
  | '비용'
  | '보험보장'
  | '수술안전성마취'
  | '회복기간'
  | '효과지속성'
  | '타치료차이';

// ── Form Input ──────────────────────────────────────────────────────────────

export interface ConsultationFormInput {
  연령대: AgeGroup;
  성별: Gender;
  손상경위: InjuryCause;
  통증기간: PainDuration;
  활동이력: ActivityHistory;
  치료목표: TreatmentGoal[];              // 다중 선택
  실손보험: InsuranceGeneration;
  의사결정단계: DecisionStage;
  동반자: Companion;
  사전정보수준: InfoLevel;
  주요우려: PrimaryConcern[];             // 다중 선택, max 3
}

// ── Form Field Definitions (for rendering) ──────────────────────────────────

export interface FormFieldOption {
  value: string;
  label: string;
}

export interface FormFieldDef {
  key: keyof ConsultationFormInput;
  label: string;
  type: 'select' | 'multiselect';
  maxSelect?: number;
  options: FormFieldOption[];
}

export const FORM_FIELDS: FormFieldDef[] = [
  {
    key: '연령대',
    label: '연령대',
    type: 'select',
    options: [
      { value: '30대이하', label: '30대 이하' },
      { value: '40대', label: '40대' },
      { value: '50대', label: '50대' },
      { value: '60대', label: '60대' },
      { value: '70대이상', label: '70대 이상' },
    ],
  },
  {
    key: '성별',
    label: '성별',
    type: 'select',
    options: [
      { value: '남', label: '남성' },
      { value: '여', label: '여성' },
      { value: '미응답', label: '미응답' },
    ],
  },
  {
    key: '손상경위',
    label: '손상 경위',
    type: 'select',
    options: [
      { value: '갑작스러운 부상', label: '갑작스러운 부상 (운동·사고)' },
      { value: '운동 즐겨왔는데 악화', label: '운동을 즐겨왔는데 점점 악화' },
      { value: '일·가사로 무릎 많이 써서', label: '일·가사로 무릎을 많이 써서' },
      { value: '특별한 계기없이 서서히', label: '특별한 계기 없이 서서히' },
      { value: '모름', label: '잘 모르겠음' },
    ],
  },
  {
    key: '통증기간',
    label: '통증 기간',
    type: 'select',
    options: [
      { value: '6개월미만', label: '6개월 미만' },
      { value: '6개월~2년', label: '6개월 ~ 2년' },
      { value: '2년이상', label: '2년 이상' },
    ],
  },
  {
    key: '활동이력',
    label: '활동 이력',
    type: 'select',
    options: [
      { value: '평생좌식', label: '평생 좌식 생활' },
      { value: '일상활동수준', label: '일상 활동 수준' },
      { value: '과거활동적지금제한', label: '과거 활동적 → 지금 제한' },
      { value: '현재규칙적운동', label: '현재 규칙적 운동 중' },
      { value: '고강도스포츠', label: '고강도 스포츠' },
    ],
  },
  {
    key: '치료목표',
    label: '치료 목표 (복수 선택 가능)',
    type: 'multiselect',
    options: [
      { value: '통증완화', label: '통증 완화' },
      { value: '운동취미복귀', label: '운동·취미 복귀' },
      { value: '인공관절지연회피', label: '인공관절 지연·회피' },
      { value: '직업가사복귀', label: '직업·가사 복귀' },
      { value: '일상독립성유지', label: '일상 독립성 유지' },
    ],
  },
  {
    key: '실손보험',
    label: '실손보험 세대',
    type: 'select',
    options: [
      { value: '1~2세대', label: '1~2세대' },
      { value: '3세대', label: '3세대' },
      { value: '4세대', label: '4세대' },
      { value: '5세대', label: '5세대' },
      { value: '없음모름', label: '없음 / 모름' },
    ],
  },
  {
    key: '의사결정단계',
    label: '의사결정 단계',
    type: 'select',
    options: [
      { value: '첫탐색', label: '처음 알아보는 중' },
      { value: '타치료비교중', label: '다른 치료와 비교 중' },
      { value: '거의결정실무확인', label: '거의 결정, 실무 확인' },
    ],
  },
  {
    key: '동반자',
    label: '내원 동반자',
    type: 'select',
    options: [
      { value: '본인단독', label: '본인 단독' },
      { value: '배우자', label: '배우자' },
      { value: '자녀', label: '자녀' },
      { value: '기타', label: '기타' },
    ],
  },
  {
    key: '사전정보수준',
    label: '사전 정보 수준',
    type: 'select',
    options: [
      { value: '거의모름', label: '거의 모름' },
      { value: '검색다수용어익숙', label: '검색 다수, 용어 익숙' },
      { value: '타병원상담경험', label: '타병원 상담 경험 있음' },
    ],
  },
  {
    key: '주요우려',
    label: '주요 우려 (최대 3개)',
    type: 'multiselect',
    maxSelect: 3,
    options: [
      { value: '비용', label: '비용' },
      { value: '보험보장', label: '보험 보장 여부' },
      { value: '수술안전성마취', label: '수술 안전성·마취' },
      { value: '회복기간', label: '회복 기간' },
      { value: '효과지속성', label: '효과 지속성' },
      { value: '타치료차이', label: '다른 치료와의 차이' },
    ],
  },
];

// ── Persona Types ───────────────────────────────────────────────────────────

export type AAxisId = 'A1' | 'A2' | 'A3' | 'A4';
export type BAxisId = 'B1' | 'B2' | 'B3' | 'B4';

export interface GenderAgeVariant {
  조건: string;
  조정사항: string;
}

export interface PersonaBase {
  id: string;
  name: string;
  emoji: string;
  summary: string;
  psychology: string;
  signatureQuestions: string[];
  strategy: string[];
  complianceFlags: string[];
  mismatchSignals: string[];
  genderAgeVariants: GenderAgeVariant[];
}

export interface AAxisPersona extends PersonaBase {
  id: AAxisId;
  typicalAge: string;
  typicalDuration: string;
  typicalActivity: string;
}

export interface BAxisPersona extends PersonaBase {
  id: BAxisId;
  primaryConcerns: string[];
  decisionPattern: string;
}

export interface MatchResult {
  aAxis: AAxisId;
  bAxis: BAxisId;
  aScore: Record<AAxisId, number>;
  bScore: Record<BAxisId, number>;
  aIsBlend: boolean;
  bIsBlend: boolean;
  aBlendIds?: [AAxisId, AAxisId];
  bBlendIds?: [BAxisId, BAxisId];
  aPersona: AAxisPersona;
  bPersona: BAxisPersona;
  briefingLabel: string;
}

// ── A-Axis Personas ─────────────────────────────────────────────────────────

export const A_AXIS_PERSONAS: Record<AAxisId, AAxisPersona> = {
  A1: {
    id: 'A1',
    name: '급성 외상·스포츠 손상형',
    emoji: '⚡',
    typicalAge: '30~40대',
    typicalDuration: '6개월 미만',
    typicalActivity: '고강도스포츠 또는 현재규칙적운동',
    summary:
      '갑작스러운 부상이나 스포츠 손상으로 내원. 비교적 젊고, "원래대로 돌아갈 수 있다"는 기대가 강합니다.',
    psychology:
      '신체를 자기 정체성의 핵심으로 인식합니다. 부상 전 상태를 "정상"으로 간주하며 완전한 복귀를 기대합니다. ' +
      '치료를 "수리"로 인식하는 경향이 강해, 결과가 기대에 못 미치면 실망이 큽니다. ' +
      '젊기 때문에 장기 예후에 대한 관심이 높고, 수술 후 언제 운동을 다시 할 수 있는지가 핵심 관심사입니다.',
    signatureQuestions: [
      '운동 다시 할 수 있나요? 언제쯤 가능할까요?',
      '수술하면 예전처럼 돌아가나요?',
      '연골이 다시 자라는 건가요?',
      '같은 부상이 또 생길 수 있나요?',
      '재활은 얼마나 걸리나요?',
    ],
    strategy: [
      '기대 수준을 현실적으로 조정하되, 희망을 유지하는 균형 잡힌 설명',
      '"완전히 예전으로"가 아닌, "기능적 회복" 프레임으로 전환',
      '재활 타임라인을 구체적 단계로 제시 (예: 4주 보행, 3개월 가벼운 운동, 6개월 이후 점진적 복귀)',
      '카티스템의 연골 재생 촉진 메커니즘을 젊은 환자의 회복력과 연결하여 설명',
      '장기 관절 보존 관점에서 지금 치료의 의미 강조',
    ],
    complianceFlags: [
      '복귀 시기에 대한 과도한 약속 금지',
      '"예전과 똑같이"라는 표현 지양',
      '연골 재생의 한계를 정직하게 설명',
      '재활 과정의 중요성 반드시 언급',
      '운동 종류별 복귀 가능성 차등 설명 필요',
    ],
    mismatchSignals: [
      '손상 경위가 "갑작스러운 부상"인데 연령이 70대 이상',
      '활동 이력이 "평생좌식"인데 A1으로 분류됨',
      '통증 기간이 2년 이상인데 급성으로 분류됨',
    ],
    genderAgeVariants: [
      {
        조건: '30대 남성',
        조정사항:
          '스포츠 복귀 욕구가 매우 강함. 구체적 종목별 복귀 가능성 데이터 준비. ' +
          '동료·팀 활동 복귀에 대한 사회적 동기 고려.',
      },
      {
        조건: '30~40대 여성',
        조정사항:
          '운동 외에도 육아·일상 활동 복귀 병행 관심. ' +
          '미용적 측면(흉터 최소화) 우려 가능성. 회복 중 가사 부담 논의.',
      },
      {
        조건: '40대 남성',
        조정사항:
          '직장 복귀 시기 관심 높음. 스포츠는 주말 활동 수준일 수 있음. ' +
          '체력 저하에 대한 심리적 거부감 존재.',
      },
    ],
  },

  A2: {
    id: 'A2',
    name: '스포츠 애호→퇴행 전환형',
    emoji: '🎿',
    typicalAge: '50~60대',
    typicalDuration: '6개월~2년',
    typicalActivity: '과거활동적지금제한',
    summary:
      '오래 운동을 즐겨왔지만 무릎이 점점 나빠져 활동이 줄어드는 상황. ' +
      '활동적이던 자신의 정체성을 잃어가는 상실감이 큽니다.',
    psychology:
      '"운동하는 사람"이라는 자기 정체성이 강합니다. 무릎 퇴행은 단순한 신체 문제가 아니라 ' +
      '자기 이미지의 훼손으로 느껴집니다. "나이 들어 못 하게 되는 것"에 대한 저항감이 있으며, ' +
      '동시에 "더 심해지기 전에 뭔가 해야 한다"는 절박함도 공존합니다. ' +
      '과거 운동 경험이 있어 신체에 대한 이해도는 높지만, 퇴행성 변화를 받아들이기 어려워합니다.',
    signatureQuestions: [
      '등산(골프/테니스)은 다시 할 수 있을까요?',
      '이대로 두면 얼마나 더 나빠지나요?',
      '카티스템 하고 나서 운동 강도를 어디까지 올릴 수 있나요?',
      '인공관절까지 가지 않으려면 지금 해야 하나요?',
      '줄기세포랑 뭐가 다른 건가요?',
    ],
    strategy: [
      '"활동적 생활의 연장"이라는 프레임으로 카티스템 설명',
      '지금 단계에서의 치료가 관절 보존 기간을 늘릴 수 있음을 강조',
      '운동 종류별 "할 수 있는 것 vs 조정이 필요한 것" 구분하여 제시',
      '퇴행의 자연 경과를 설명하되, 치료 개입의 의미를 함께 전달',
      '과거 운동 경험을 재활 과정의 강점으로 활용 (체력·이해력 장점)',
      '인공관절 시점을 늦추는 전략으로서의 카티스템 포지셔닝',
    ],
    complianceFlags: [
      '"다시 뛸 수 있습니다" 류의 복귀 보장 표현 금지',
      '퇴행의 비가역성을 부정하지 말 것',
      '운동 종류별 현실적 기대치 제시 필수',
      '비교 치료(PRP, 줄기세포 등)와의 차이 정확히 설명',
      '"안 하면 큰일 난다" 식의 공포 유도 금지',
    ],
    mismatchSignals: [
      '활동 이력이 "평생좌식"인데 A2로 분류됨',
      '손상 경위가 "갑작스러운 부상"인데 퇴행 전환형으로 분류됨',
      '30대 이하인데 퇴행 전환형으로 분류됨',
    ],
    genderAgeVariants: [
      {
        조건: '50대 남성',
        조정사항:
          '골프·등산·축구 등 특정 종목 복귀에 집착할 수 있음. ' +
          '직장 은퇴 전 "마지막 활동기" 인식. 남성적 자존감과 체력의 연결.',
      },
      {
        조건: '50대 여성',
        조정사항:
          '요가·수영·등산 등 건강 유지 차원의 운동. ' +
          '폐경 후 골다공증과의 연관 질문 가능. 커뮤니티 활동 복귀 동기.',
      },
      {
        조건: '60대',
        조정사항:
          '은퇴 후 여가 활동이 삶의 중심. 부부 동반 활동(여행, 등산) 동기 강함. ' +
          '인공관절 시기를 최대한 미루고 싶은 욕구 상승.',
      },
    ],
  },

  A3: {
    id: 'A3',
    name: '근면 생활 퇴행형',
    emoji: '🌾',
    typicalAge: '50~70대',
    typicalDuration: '2년 이상',
    typicalActivity: '일상활동수준',
    summary:
      '오랜 세월 일·가사로 무릎을 혹사한 결과 퇴행이 진행된 유형. ' +
      '치료보다 "쉴 수 없는 현실"이 더 큰 고민입니다.',
    psychology:
      '몸은 "도구"라는 인식이 강합니다. 아파도 일을 멈출 수 없었던 경험이 반복되며, ' +
      '치료 기간 동안의 업무·가사 공백이 가장 큰 현실적 장벽입니다. ' +
      '본인의 건강보다 가족·생계 책임을 우선시하는 경향이 있어, ' +
      '"나를 위한 투자"로서의 치료에 심리적 장벽을 느낍니다. ' +
      '비용 민감도도 높을 수 있으나, 핵심은 "쉴 수 없다"는 현실적 압박입니다.',
    signatureQuestions: [
      '수술 후 언제부터 일할 수 있나요?',
      '입원은 며칠이나 해야 하나요?',
      '가사(장보기, 계단)는 언제부터 가능한가요?',
      '보험 적용이 되나요? 실비로 얼마나 나오나요?',
      '참고 버티면 안 되는 건가요?',
    ],
    strategy: [
      '회복 후 "더 오래 일할 수 있는 몸 만들기" 프레임',
      '입원·재활 기간의 구체적 타임라인 먼저 제시하여 공백 불안 완화',
      '가사·업무별 복귀 시점을 실용적으로 설명 (계단 2주, 장보기 3주 등)',
      '보험·비용 정보를 구체적으로 제공하되, 과장하지 않기',
      '가족 내 역할 조정 방법도 함께 논의 (동반자 있을 경우)',
      '"지금 치료하면 장기적으로 일할 수 있는 기간이 늘어난다" 관점 제시',
    ],
    complianceFlags: [
      '비용·보험에 대한 부정확한 정보 제공 금지',
      '"쉬면서 치료해야 한다"는 이상적 조언만 하지 말 것 – 현실 인정 필요',
      '생계 부담을 가볍게 다루지 말 것',
      '"안 하면 더 큰 비용이 든다" 식의 압박 주의',
      '가사노동의 강도를 과소평가하지 말 것',
    ],
    mismatchSignals: [
      '활동 이력이 "고강도스포츠"인데 A3으로 분류됨',
      '손상 경위가 "갑작스러운 부상"인데 근면 퇴행형으로 분류됨',
      '30대 이하 + 단기 통증인데 A3으로 분류됨',
    ],
    genderAgeVariants: [
      {
        조건: '50~60대 여성',
        조정사항:
          '가사노동 강도 높음 (쪼그려 앉기, 걸레질 등). "집안일은 쉴 수 없다" 인식. ' +
          '남편·자녀 설득이 필요한 경우 많음. 본인 건강 투자 죄책감.',
      },
      {
        조건: '50~60대 남성',
        조정사항:
          '육체노동·현장직 종사 가능성. 산재 관련 질문 가능. ' +
          '일을 못 하는 기간의 소득 보전이 핵심 관심사.',
      },
      {
        조건: '70대',
        조정사항:
          '일보다 가사·돌봄(손자녀) 역할이 중심. ' +
          '자녀가 비용 부담 주체일 수 있음. 마취 안전성 우려 증가.',
      },
    ],
  },

  A4: {
    id: 'A4',
    name: '자연 노화 퇴행형',
    emoji: '🍂',
    typicalAge: '60~70대 이상',
    typicalDuration: '2년 이상',
    typicalActivity: '평생좌식 또는 일상활동수준',
    summary:
      '특별한 계기 없이 자연스럽게 무릎이 나빠진 유형. ' +
      '"이 나이에 수술까지 해야 하나"라는 체념과 동시에 "좀 더 걷고 싶다"는 소박한 바람이 있습니다.',
    psychology:
      '노화를 자연스러운 과정으로 수용하는 편이지만, 동시에 독립적 일상생활이 제한되는 것에 대한 ' +
      '두려움도 있습니다. 치료에 대한 기대치가 낮은 편이라 "큰 변화"보다 "작은 개선"이 더 와닿습니다. ' +
      '자녀·배우자의 의견에 영향을 많이 받으며, 의료진에 대한 권위 인정도가 높습니다. ' +
      '마취·수술 자체에 대한 불안이 있을 수 있고, "남은 인생에서 가치가 있는 투자인가"를 고민합니다.',
    signatureQuestions: [
      '이 나이에 효과가 있나요?',
      '마취가 걱정인데 위험하지 않나요?',
      '인공관절 말고 다른 방법은 없나요?',
      '얼마나 오래 효과가 가나요?',
      '수술이 아니라 주사 같은 건가요?',
    ],
    strategy: [
      '"일상의 질 개선"이라는 소박하지만 구체적인 목표 설정',
      '마취·수술 과정을 단계별로 차분히 설명하여 불안 완화',
      '"나이 때문에 안 된다"가 아닌 "나이에 맞는 기대효과" 프레임',
      '인공관절과의 차이를 명확히 하되 대립 구도가 아닌 단계적 옵션으로 설명',
      '동반 가족(특히 자녀)에게도 설명할 수 있는 핵심 메시지 준비',
      '효과 지속 기간을 정직하게 제시하되 "의미 있는 기간"으로 프레이밍',
      '시술 과정의 부담이 적음을 구체적으로 설명 (절개 크기, 입원 기간 등)',
    ],
    complianceFlags: [
      '"나이가 많으니 어쩔 수 없다"는 체념 조장 금지',
      '마취 위험을 과소평가하지 말되, 과장도 금지',
      '효과 지속 기간에 대한 비현실적 약속 금지',
      '자녀 앞에서 환자 자율성을 훼손하지 말 것',
      '"안 하면 걷지 못하게 된다" 식의 공포 유도 금지',
    ],
    mismatchSignals: [
      '30~40대인데 A4로 분류됨',
      '활동 이력이 "고강도스포츠"인데 자연 노화형으로 분류됨',
      '통증 기간이 6개월 미만인데 A4로 분류됨',
    ],
    genderAgeVariants: [
      {
        조건: '60대 여성',
        조정사항:
          '퇴행성 관절염 유병률 높음. 가사·손자녀 돌봄 동기. ' +
          '폐경 후 골밀도 저하 병행 확인. 수술 흉터 걱정 가능.',
      },
      {
        조건: '60대 남성',
        조정사항:
          '은퇴 후 활동량 감소 배경. "아직 젊다"는 자존감 고려. ' +
          '배우자 동반 시 배우자의 의견도 경청 필요.',
      },
      {
        조건: '70대 이상',
        조정사항:
          '마취 안전성 설명이 핵심. 자녀가 의사결정 주체인 경우 다수. ' +
          '보행 독립성 유지가 삶의 질 핵심. 동반 질환(고혈압, 당뇨) 고려.',
      },
    ],
  },
};

// ── B-Axis Personas ─────────────────────────────────────────────────────────

export const B_AXIS_PERSONAS: Record<BAxisId, BAxisPersona> = {
  B1: {
    id: 'B1',
    name: '인공관절 회피형',
    emoji: '🦵',
    primaryConcerns: ['인공관절지연회피', '효과지속성'],
    decisionPattern: '인공관절을 피하거나 최대한 미루는 것이 핵심 의사결정 기준',
    summary:
      '"내 무릎을 지키고 싶다"는 강한 동기. 인공관절의 이물감·재수술 가능성에 대한 거부감이 크며, ' +
      '자연 관절 보존에 높은 가치를 둡니다.',
    psychology:
      '인공관절에 대한 부정적 경험담(주변인, 온라인)의 영향이 클 수 있습니다. ' +
      '"내 몸에 금속을 넣는다"는 심리적 저항감, 재수술 가능성에 대한 불안, ' +
      '"한번 하면 돌이킬 수 없다"는 비가역성에 대한 두려움이 핵심입니다. ' +
      '카티스템을 "인공관절 전 마지막 기회"로 인식할 가능성이 높습니다.',
    signatureQuestions: [
      '이걸로 인공관절을 안 해도 되나요?',
      '인공관절을 몇 년이나 미룰 수 있나요?',
      '효과가 없으면 그때 인공관절 해도 되나요?',
      '카티스템 하면 인공관절 수술이 더 어려워지진 않나요?',
      '인공관절 말고 이 방법이 최선인가요?',
    ],
    strategy: [
      '카티스템을 "인공관절 대체재"가 아닌 "관절 보존 전략의 한 옵션"으로 포지셔닝',
      '인공관절 지연 효과에 대한 현실적 기대치 설정 (기간 단정 X)',
      '"이후에도 인공관절 가능" – 비가역적 선택이 아님을 안심시키기',
      '인공관절 자체의 장단점도 균형 있게 설명 (과도한 폄훼 금지)',
      '연골 보존 상태에 따른 카티스템 적합성 정직하게 평가',
    ],
    complianceFlags: [
      '"인공관절 안 해도 됩니다"라는 단정 금지',
      '인공관절을 지나치게 부정적으로 묘사하지 말 것',
      '카티스템 효과 지속 기간에 대한 과도한 약속 금지',
      '"인공관절은 나중에 해도 된다"는 단순화 주의',
      '환자의 관절 상태에 따라 인공관절이 더 적합할 수 있음을 배제하지 말 것',
    ],
    mismatchSignals: [
      '주요 우려에 "인공관절 지연" 관련이 없는데 B1으로 분류됨',
      '치료 목표에 "인공관절지연회피"가 없는데 B1으로 분류됨',
      '이미 인공관절을 긍정적으로 고려 중인 신호가 있는 경우',
    ],
    genderAgeVariants: [
      {
        조건: '50대',
        조정사항:
          '"아직 너무 젊어서 인공관절은 이르다"는 의료적 판단과 환자 심리가 일치. ' +
          '인공관절 수명(15~20년)과 재수술 문제 강조 효과적.',
      },
      {
        조건: '60대',
        조정사항:
          '인공관절 적정 시기에 가까워지는 연령. ' +
          '카티스템으로 5~10년 벌 수 있다면 의미 있다는 프레이밍.',
      },
      {
        조건: '70대 이상',
        조정사항:
          '인공관절 수술 자체의 부담(전신마취, 회복)에 대한 회피일 수 있음. ' +
          '카티스템의 상대적 저침습성 강조.',
      },
    ],
  },

  B2: {
    id: 'B2',
    name: '비용·보험 민감형',
    emoji: '💰',
    primaryConcerns: ['비용', '보험보장'],
    decisionPattern: '비용 대비 효과와 보험 적용 범위가 핵심 의사결정 기준',
    summary:
      '"얼마나 들고, 보험은 되나요?"가 첫 질문. 치료 효과보다 경제적 합리성을 먼저 따지며, ' +
      '보험 적용 여부가 치료 결정의 결정적 변수입니다.',
    psychology:
      '의료비 부담에 대한 현실적 압박이 큽니다. 실손보험 세대에 따라 보장 범위가 크게 달라지며, ' +
      '이에 대한 정확한 정보를 원합니다. "돈을 들인 만큼의 가치가 있는가"를 꼼꼼히 따지며, ' +
      '비용 정보가 불투명하면 신뢰가 급격히 떨어집니다. ' +
      '가격 비교(타 병원, 타 치료)를 이미 해봤을 가능성이 높습니다.',
    signatureQuestions: [
      '총 비용이 얼마인가요? 숨은 비용은 없나요?',
      '실손보험으로 얼마나 돌려받을 수 있나요?',
      '보험 청구 절차는 어떻게 되나요?',
      '다른 병원보다 비싼가요? 싼가요?',
      '분할 납부가 가능한가요?',
      'PRP나 줄기세포보다 비싼 이유가 뭔가요?',
    ],
    strategy: [
      '비용 구조를 투명하게 공개 (시술비, 입원비, 재활비 항목별)',
      '실손보험 세대별 예상 환급 범위를 솔직하게 안내 (확정 X, 범위 O)',
      '비용 대비 효과를 객관적으로 설명 (인공관절 총비용 vs 카티스템 비용 비교 등)',
      '타 치료(PRP, HA주사, 줄기세포)와의 가격·효과 비교 자료 준비',
      '보험 청구 지원 절차 안내',
      '분할 납부·카드 결제 등 실질적 정보 제공',
    ],
    complianceFlags: [
      '"보험 다 됩니다" 금지 – 세대별 차이 정확히 안내',
      '타 병원 비용을 비하하거나 비교하여 유인하지 말 것',
      '비용 정보를 모호하게 두지 말 것 – 신뢰 하락 직결',
      '보험 환급액을 확정적으로 말하지 말 것 (보험사 심사 변수 존재)',
      '"싼 치료는 효과 없다"는 식의 가격 정당화 주의',
    ],
    mismatchSignals: [
      '주요 우려에 "비용"과 "보험보장"이 모두 없는데 B2로 분류됨',
      '실손보험이 "없음모름"인데 보험 민감형으로 분류됨 (비용 민감은 가능)',
      '의사결정 단계가 "거의결정실무확인"인데 비용이 최우선인 경우 재확인 필요',
    ],
    genderAgeVariants: [
      {
        조건: '실손 1~2세대',
        조정사항:
          '보장 범위가 넓어 본인 부담이 적을 수 있음. ' +
          '구체적 환급 예상액 제시가 의사결정에 큰 도움.',
      },
      {
        조건: '실손 4~5세대 또는 없음',
        조정사항:
          '본인 부담이 클 수 있음. 총비용 대비 장기 절감 효과 설명. ' +
          '분할 납부 옵션 적극 안내.',
      },
      {
        조건: '자녀 동반',
        조정사항:
          '비용 부담 주체가 자녀일 수 있음. ' +
          '자녀에게 "부모님의 삶의 질 투자" 프레이밍 필요.',
      },
    ],
  },

  B3: {
    id: 'B3',
    name: '안전·신중형',
    emoji: '🛡️',
    primaryConcerns: ['수술안전성마취', '회복기간'],
    decisionPattern: '위험 최소화가 핵심. 안전이 확인되어야 다음 단계로 진행',
    summary:
      '"안전한가요?"가 모든 질문의 전제. 효과보다 부작용·합병증·마취 위험을 먼저 확인하며, ' +
      '충분히 안심이 되어야 결정합니다.',
    psychology:
      '위험 회피 성향이 강합니다. 새로운 시술에 대한 불안, 마취에 대한 공포, ' +
      '합병증 사례에 대한 과민 반응이 있을 수 있습니다. ' +
      '"혹시나"에 대한 걱정이 크며, 의사의 경험·실적·자격에 대한 확인 욕구도 높습니다. ' +
      '결정을 서두르지 않고 충분한 정보를 모은 후 판단하려 합니다. ' +
      '동반자(배우자, 자녀)의 안심이 본인의 안심으로 이어지는 경우가 많습니다.',
    signatureQuestions: [
      '부작용이나 합병증은 어떤 게 있나요?',
      '마취는 어떻게 하나요? 전신마취인가요?',
      '지금까지 수술 몇 건 하셨나요?',
      '실패 사례도 있나요?',
      '수술 중에 문제가 생기면 어떻게 하나요?',
      '다른 약 먹고 있는데 괜찮은가요?',
    ],
    strategy: [
      '안전성 관련 질문에 먼저, 충분히 답변한 후 효과 설명으로 넘어가기',
      '카티스템의 식약처 인허가 경과 및 임상 데이터 기반 안전성 제시',
      '마취 방식(부분마취 가능 여부)을 구체적으로 설명',
      '합병증 발생률을 정직하게 수치로 제시 (과소·과장 모두 금지)',
      '의료진 경력·시술 건수를 자연스럽게 언급',
      '동반자에게도 안전성 설명 기회를 제공',
      '충분한 시간을 주고 결정을 재촉하지 않기',
    ],
    complianceFlags: [
      '"안전합니다"라는 무조건적 보장 금지',
      '합병증 가능성을 숨기거나 축소하지 말 것',
      '마취 위험을 "별것 아닌 것"으로 치부하지 말 것',
      '결정을 재촉하는 뉘앙스 금지',
      '"걱정할 것 없다"는 식의 환자 불안 무시 금지',
    ],
    mismatchSignals: [
      '주요 우려에 안전성 관련 항목이 없는데 B3로 분류됨',
      '의사결정 단계가 "거의결정실무확인"인데 안전 불안이 주요 드라이버인 경우 재확인',
      '사전 정보 수준이 높고 이미 안전성을 확인한 후인 경우',
    ],
    genderAgeVariants: [
      {
        조건: '고령 (70대 이상)',
        조정사항:
          '마취 위험에 대한 불안이 특히 높음. 동반 질환별 마취 안전성 구체적 설명. ' +
          '부분마취·진정마취 옵션 먼저 제시.',
      },
      {
        조건: '자녀 동반',
        조정사항:
          '자녀가 안전성 검증 역할을 자임하는 경우 많음. ' +
          '자녀에게 데이터 기반 설명, 환자 본인에게는 감정적 안심 병행.',
      },
      {
        조건: '여성',
        조정사항:
          '마취 후 메스꺼움·구토 우려, 수술 후 통증 관리에 대한 구체적 설명 효과적. ' +
          '시술 과정을 단계별로 상세 설명하면 불안 감소.',
      },
    ],
  },

  B4: {
    id: 'B4',
    name: '근거 검증형',
    emoji: '🔍',
    primaryConcerns: ['효과지속성', '타치료차이'],
    decisionPattern: '객관적 근거와 데이터로 납득해야 결정. 감정적 설득에 저항',
    summary:
      '"논문이나 데이터가 있나요?" 타입. 감정적 설득보다 객관적 근거를 요구하며, ' +
      '의료진의 전문성을 시험하는 질문을 던지기도 합니다.',
    psychology:
      '분석적·논리적 성향이 강합니다. 인터넷 검색을 통해 이미 상당한 정보를 수집했을 가능성이 높으며, ' +
      '다른 병원 상담 경험이 있을 수 있습니다. "진짜 효과가 있는지"를 검증하려 하며, ' +
      '마케팅과 의학적 사실을 구분하려 합니다. ' +
      '의료진이 정직하게 한계를 인정할 때 오히려 신뢰가 올라갑니다. ' +
      '과장된 주장에 대한 경계심이 높고, 전문용어를 어느 정도 이해합니다.',
    signatureQuestions: [
      '임상 시험 결과가 있나요? 몇 년 추적 데이터인가요?',
      '카티스템과 줄기세포 치료의 차이가 정확히 뭔가요?',
      '논문에서 효과가 없다는 연구도 있던데요?',
      'MRI 결과로 볼 때 제 연골 상태에서 효과가 있나요?',
      '성공률이 몇 %인가요? 어떤 기준의 성공인가요?',
      '어떤 환자에게는 안 하는 게 나은가요?',
    ],
    strategy: [
      '임상 데이터·논문 기반으로 설명 (저자, 저널, 추적 기간 구체적으로)',
      '효과의 한계를 먼저 인정하고, 그 안에서의 기대효과를 제시',
      '타 치료(PRP, HA, 줄기세포, 인공관절)와의 비교를 데이터 기반으로',
      '환자 본인의 MRI·영상 자료를 직접 보여주며 설명',
      '감정적 설득("좋아진 환자분들이 많으세요") 최소화',
      '"이런 경우에는 카티스템이 적합하지 않다"는 사례도 정직하게 공유',
      '환자가 가져온 정보(다른 병원 소견, 인터넷 자료)를 존중하며 논의',
    ],
    complianceFlags: [
      '근거 없는 주장 금지 – 논문·데이터 없으면 "아직 근거 부족"이라 말할 것',
      '질문을 귀찮아하거나 방어적으로 대응하지 말 것',
      '환자의 사전 지식을 무시하거나 깎아내리지 말 것',
      '"많은 분들이 좋아지셨어요" 식의 일화적 근거에 의존하지 말 것',
      '성공률 수치를 제시할 때 기준(통증 개선? 연골 재생? 기능 회복?)을 명시할 것',
    ],
    mismatchSignals: [
      '사전 정보 수준이 "거의모름"인데 B4로 분류됨',
      '주요 우려에 "효과지속성"이나 "타치료차이"가 없는데 B4로 분류됨',
      '의사결정 단계가 "첫탐색"이고 정보 수준이 낮은 경우',
    ],
    genderAgeVariants: [
      {
        조건: '타병원상담경험',
        조정사항:
          '다른 병원에서 들은 정보와의 일관성/차이점 정리 필요. ' +
          '"왜 여기가 다른가"에 대한 차별점을 데이터로 제시.',
      },
      {
        조건: '검색다수용어익숙',
        조정사항:
          '전문 용어를 적절히 사용해도 됨. ' +
          '논문 DOI나 구체적 저널명을 언급하면 신뢰도 상승.',
      },
      {
        조건: '자녀 동반 (자녀가 검증 주체)',
        조정사항:
          '자녀가 온라인 검색 후 부모를 대신해 질문하는 패턴. ' +
          '자녀에게는 데이터, 부모에게는 안심 메시지 이중 전략.',
      },
    ],
  },
};

// ── Scoring Matrices ────────────────────────────────────────────────────────

// A-axis scoring: 손상경위(×4) + 활동이력(×2) + 통증기간(×1) + 연령대(×1)

const A_INJURY_CAUSE_SCORES: Record<InjuryCause, Record<AAxisId, number>> = {
  '갑작스러운 부상':           { A1: 10, A2: 2,  A3: 1,  A4: 0  },
  '운동 즐겨왔는데 악화':      { A1: 3,  A2: 10, A3: 1,  A4: 2  },
  '일·가사로 무릎 많이 써서':   { A1: 0,  A2: 1,  A3: 10, A4: 3  },
  '특별한 계기없이 서서히':     { A1: 0,  A2: 2,  A3: 3,  A4: 10 },
  '모름':                     { A1: 1,  A2: 3,  A3: 4,  A4: 6  },
};

const A_ACTIVITY_SCORES: Record<ActivityHistory, Record<AAxisId, number>> = {
  '평생좌식':            { A1: 0,  A2: 0,  A3: 4,  A4: 8  },
  '일상활동수준':         { A1: 1,  A2: 2,  A3: 7,  A4: 6  },
  '과거활동적지금제한':    { A1: 2,  A2: 9,  A3: 3,  A4: 4  },
  '현재규칙적운동':       { A1: 6,  A2: 7,  A3: 2,  A4: 1  },
  '고강도스포츠':         { A1: 10, A2: 4,  A3: 0,  A4: 0  },
};

const A_PAIN_DURATION_SCORES: Record<PainDuration, Record<AAxisId, number>> = {
  '6개월미만':  { A1: 10, A2: 3, A3: 2, A4: 1 },
  '6개월~2년': { A1: 5,  A2: 8, A3: 6, A4: 4 },
  '2년이상':   { A1: 1,  A2: 5, A3: 8, A4: 9 },
};

const A_AGE_SCORES: Record<AgeGroup, Record<AAxisId, number>> = {
  '30대이하':  { A1: 10, A2: 1, A3: 1, A4: 0 },
  '40대':     { A1: 7,  A2: 4, A3: 3, A4: 1 },
  '50대':     { A1: 3,  A2: 8, A3: 7, A4: 3 },
  '60대':     { A1: 1,  A2: 6, A3: 7, A4: 8 },
  '70대이상':  { A1: 0,  A2: 3, A3: 5, A4: 10 },
};

// B-axis scoring: 주요우려(×3) + 치료목표(×3) + 의사결정단계(×2) + 사전정보수준(×2) + 실손세대(×1) + 동반자(×1)

const B_CONCERN_SCORES: Record<PrimaryConcern, Record<BAxisId, number>> = {
  '비용':          { B1: 1,  B2: 10, B3: 2,  B4: 2  },
  '보험보장':       { B1: 1,  B2: 10, B3: 1,  B4: 1  },
  '수술안전성마취':  { B1: 2,  B2: 1,  B3: 10, B4: 3  },
  '회복기간':       { B1: 3,  B2: 3,  B3: 7,  B4: 2  },
  '효과지속성':     { B1: 7,  B2: 2,  B3: 3,  B4: 9  },
  '타치료차이':     { B1: 4,  B2: 3,  B3: 2,  B4: 10 },
};

const B_GOAL_SCORES: Record<TreatmentGoal, Record<BAxisId, number>> = {
  '통증완화':       { B1: 3,  B2: 4,  B3: 5,  B4: 4  },
  '운동취미복귀':   { B1: 5,  B2: 2,  B3: 3,  B4: 6  },
  '인공관절지연회피': { B1: 10, B2: 3,  B3: 4,  B4: 5  },
  '직업가사복귀':    { B1: 3,  B2: 6,  B3: 5,  B4: 2  },
  '일상독립성유지':  { B1: 4,  B2: 3,  B3: 6,  B4: 3  },
};

const B_DECISION_STAGE_SCORES: Record<DecisionStage, Record<BAxisId, number>> = {
  '첫탐색':         { B1: 5, B2: 5, B3: 7, B4: 4 },
  '타치료비교중':    { B1: 6, B2: 7, B3: 5, B4: 9 },
  '거의결정실무확인': { B1: 5, B2: 8, B3: 4, B4: 6 },
};

const B_INFO_LEVEL_SCORES: Record<InfoLevel, Record<BAxisId, number>> = {
  '거의모름':       { B1: 4, B2: 4, B3: 7, B4: 1 },
  '검색다수용어익숙': { B1: 6, B2: 6, B3: 5, B4: 8 },
  '타병원상담경험':  { B1: 5, B2: 7, B3: 4, B4: 10 },
};

const B_INSURANCE_SCORES: Record<InsuranceGeneration, Record<BAxisId, number>> = {
  '1~2세대': { B1: 3, B2: 4, B3: 3, B4: 3 },
  '3세대':   { B1: 3, B2: 6, B3: 3, B4: 3 },
  '4세대':   { B1: 3, B2: 7, B3: 3, B4: 3 },
  '5세대':   { B1: 3, B2: 8, B3: 3, B4: 3 },
  '없음모름': { B1: 3, B2: 9, B3: 4, B4: 3 },
};

const B_COMPANION_SCORES: Record<Companion, Record<BAxisId, number>> = {
  '본인단독': { B1: 5, B2: 5, B3: 4, B4: 7 },
  '배우자':  { B1: 5, B2: 5, B3: 6, B4: 5 },
  '자녀':   { B1: 4, B2: 6, B3: 7, B4: 6 },
  '기타':   { B1: 5, B2: 5, B3: 5, B4: 5 },
};

// ── Matching Algorithm ──────────────────────────────────────────────────────

function computeAScores(input: ConsultationFormInput): Record<AAxisId, number> {
  const ids: AAxisId[] = ['A1', 'A2', 'A3', 'A4'];
  const scores = { A1: 0, A2: 0, A3: 0, A4: 0 };

  for (const id of ids) {
    // 손상 경위 ×4
    scores[id] += (A_INJURY_CAUSE_SCORES[input.손상경위]?.[id] ?? 0) * 4;
    // 활동 이력 ×2
    scores[id] += (A_ACTIVITY_SCORES[input.활동이력]?.[id] ?? 0) * 2;
    // 통증 기간 ×1
    scores[id] += (A_PAIN_DURATION_SCORES[input.통증기간]?.[id] ?? 0) * 1;
    // 연령대 ×1
    scores[id] += (A_AGE_SCORES[input.연령대]?.[id] ?? 0) * 1;
  }

  return scores;
}

function computeBScores(input: ConsultationFormInput): Record<BAxisId, number> {
  const ids: BAxisId[] = ['B1', 'B2', 'B3', 'B4'];
  const scores = { B1: 0, B2: 0, B3: 0, B4: 0 };

  for (const id of ids) {
    // 주요 우려 ×3 (다중 선택 – 각 항목의 점수 합산)
    for (const concern of input.주요우려) {
      scores[id] += (B_CONCERN_SCORES[concern]?.[id] ?? 0) * 3;
    }
    // 치료 목표 ×3 (다중 선택)
    for (const goal of input.치료목표) {
      scores[id] += (B_GOAL_SCORES[goal]?.[id] ?? 0) * 3;
    }
    // 의사결정 단계 ×2
    scores[id] += (B_DECISION_STAGE_SCORES[input.의사결정단계]?.[id] ?? 0) * 2;
    // 사전 정보 수준 ×2
    scores[id] += (B_INFO_LEVEL_SCORES[input.사전정보수준]?.[id] ?? 0) * 2;
    // 실손 세대 ×1
    scores[id] += (B_INSURANCE_SCORES[input.실손보험]?.[id] ?? 0) * 1;
    // 동반자 ×1
    scores[id] += (B_COMPANION_SCORES[input.동반자]?.[id] ?? 0) * 1;
  }

  return scores;
}

function findTopTwo<T extends string>(
  scores: Record<T, number>,
  ids: T[],
): { top: T; second: T; isBlend: boolean } {
  const sorted = [...ids].sort((a, b) => scores[b] - scores[a]);
  const top = sorted[0];
  const second = sorted[1];
  const topScore = scores[top];
  const secondScore = scores[second];

  // Within 15% → blend
  const isBlend =
    topScore > 0 && secondScore > 0 && (topScore - secondScore) / topScore <= 0.15;

  return { top, second, isBlend };
}

export function matchPersona(input: ConsultationFormInput): MatchResult {
  const aScores = computeAScores(input);
  const bScores = computeBScores(input);

  const aAxisIds: AAxisId[] = ['A1', 'A2', 'A3', 'A4'];
  const bAxisIds: BAxisId[] = ['B1', 'B2', 'B3', 'B4'];

  const aResult = findTopTwo(aScores, aAxisIds);
  const bResult = findTopTwo(bScores, bAxisIds);

  const aPersona = A_AXIS_PERSONAS[aResult.top];
  const bPersona = B_AXIS_PERSONAS[bResult.top];

  // Build label
  let aLabel = `${aResult.top} ${aPersona.emoji}`;
  if (aResult.isBlend) {
    aLabel = `${aResult.top}+${aResult.second} 혼합 ${aPersona.emoji}`;
  }
  let bLabel = `${bResult.top} ${bPersona.emoji}`;
  if (bResult.isBlend) {
    bLabel = `${bResult.top}+${bResult.second} 혼합 ${bPersona.emoji}`;
  }

  return {
    aAxis: aResult.top,
    bAxis: bResult.top,
    aScore: aScores,
    bScore: bScores,
    aIsBlend: aResult.isBlend,
    bIsBlend: bResult.isBlend,
    aBlendIds: aResult.isBlend ? [aResult.top, aResult.second] : undefined,
    bBlendIds: bResult.isBlend ? [bResult.top, bResult.second] : undefined,
    aPersona,
    bPersona,
    briefingLabel: `${aLabel} × ${bLabel}`,
  };
}

// ── Utility: Forbidden Word Check ───────────────────────────────────────────

export function checkForbiddenWords(text: string): string[] {
  return FORBIDDEN_WORDS.filter((word) => text.includes(word));
}

// ── Utility: Get Combined Briefing Data ─────────────────────────────────────

export interface BriefingData {
  label: string;
  aPersona: AAxisPersona;
  bPersona: BAxisPersona;
  blendNotes: string[];
  combinedStrategy: string[];
  combinedComplianceFlags: string[];
  allSignatureQuestions: string[];
  mismatchWarnings: string[];
}

export function generateBriefing(
  input: ConsultationFormInput,
): BriefingData {
  const result = matchPersona(input);
  const blendNotes: string[] = [];

  if (result.aIsBlend && result.aBlendIds) {
    const secondary = A_AXIS_PERSONAS[result.aBlendIds[1]];
    blendNotes.push(
      `A축 혼합: ${result.aPersona.name}(주) + ${secondary.name}(부) – 두 유형의 심리가 공존할 수 있습니다.`,
    );
  }
  if (result.bIsBlend && result.bBlendIds) {
    const secondary = B_AXIS_PERSONAS[result.bBlendIds[1]];
    blendNotes.push(
      `B축 혼합: ${result.bPersona.name}(주) + ${secondary.name}(부) – 두 의사결정 패턴이 혼재할 수 있습니다.`,
    );
  }

  // Combine strategies (primary A + primary B, deduped)
  const combinedStrategy = [
    ...result.aPersona.strategy,
    ...result.bPersona.strategy,
  ];

  const combinedComplianceFlags = [
    ...result.aPersona.complianceFlags,
    ...result.bPersona.complianceFlags,
  ];

  const allSignatureQuestions = [
    ...result.aPersona.signatureQuestions,
    ...result.bPersona.signatureQuestions,
  ];

  // Check mismatch signals
  const mismatchWarnings: string[] = [];
  for (const signal of result.aPersona.mismatchSignals) {
    // Simple heuristic checks based on input
    if (
      result.aAxis === 'A1' &&
      input.연령대 === '70대이상' &&
      signal.includes('70대')
    ) {
      mismatchWarnings.push(signal);
    }
    if (
      result.aAxis === 'A1' &&
      input.활동이력 === '평생좌식' &&
      signal.includes('평생좌식')
    ) {
      mismatchWarnings.push(signal);
    }
    if (
      result.aAxis === 'A1' &&
      input.통증기간 === '2년이상' &&
      signal.includes('2년')
    ) {
      mismatchWarnings.push(signal);
    }
    if (
      result.aAxis === 'A4' &&
      (input.연령대 === '30대이하' || input.연령대 === '40대') &&
      signal.includes('30~40대')
    ) {
      mismatchWarnings.push(signal);
    }
    if (
      result.aAxis === 'A4' &&
      input.활동이력 === '고강도스포츠' &&
      signal.includes('고강도')
    ) {
      mismatchWarnings.push(signal);
    }
    if (
      result.aAxis === 'A4' &&
      input.통증기간 === '6개월미만' &&
      signal.includes('6개월')
    ) {
      mismatchWarnings.push(signal);
    }
    if (
      result.aAxis === 'A3' &&
      input.활동이력 === '고강도스포츠' &&
      signal.includes('고강도')
    ) {
      mismatchWarnings.push(signal);
    }
    if (
      result.aAxis === 'A3' &&
      input.손상경위 === '갑작스러운 부상' &&
      signal.includes('갑작스러운')
    ) {
      mismatchWarnings.push(signal);
    }
    if (
      result.aAxis === 'A2' &&
      input.활동이력 === '평생좌식' &&
      signal.includes('평생좌식')
    ) {
      mismatchWarnings.push(signal);
    }
    if (
      result.aAxis === 'A2' &&
      input.손상경위 === '갑작스러운 부상' &&
      signal.includes('갑작스러운')
    ) {
      mismatchWarnings.push(signal);
    }
  }

  for (const signal of result.bPersona.mismatchSignals) {
    if (
      result.bAxis === 'B4' &&
      input.사전정보수준 === '거의모름' &&
      signal.includes('거의모름')
    ) {
      mismatchWarnings.push(signal);
    }
    if (
      result.bAxis === 'B2' &&
      !input.주요우려.includes('비용') &&
      !input.주요우려.includes('보험보장') &&
      signal.includes('비용')
    ) {
      mismatchWarnings.push(signal);
    }
  }

  return {
    label: result.briefingLabel,
    aPersona: result.aPersona,
    bPersona: result.bPersona,
    blendNotes,
    combinedStrategy,
    combinedComplianceFlags,
    allSignatureQuestions,
    mismatchWarnings,
  };
}
