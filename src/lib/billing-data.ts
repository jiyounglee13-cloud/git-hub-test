// 카티스템(CARTISTEM) 동시수술 급여 청구 가이드 v2.0
// 핵심: 카티스템 자체는 비급여(환자 100% 부담)이나,
// 급여 수술과 동시 시행 시 마취료·수술실료·관절경 재료·입원료가 급여 적용됨.

// ──────────────────────────────────────────────
// Types
// ──────────────────────────────────────────────

/** OCD(이단성 골연골염) 병기별 카티스템 적응 */
export interface OcdStage {
  stage: "I" | "II" | "III" | "IV";
  description: string;
  treatment: string;
  cartistemIndication: "적응 없음" | "일반적 적응 없음" | "보조 적응 가능" | "직접 적응 (ICRS IV)";
}

/** 의무기록 권장/지양 표현 */
export interface MedicalRecordGuide {
  categoryId: string;
  recommended: string[];
  prohibited: string[];
}

/** 부당청구 위험 패턴 */
export interface RiskPattern {
  pattern: string;
  description: string;
  legalBasis: string;
}

/** 동시수술 카테고리 */
export interface SurgeryCategory {
  id: string;
  /** 섹션 번호 (예: "3.1") */
  section: string;
  /** 수술명 (한글) */
  name: string;
  /** 수술 영문 약어 */
  nameEn: string;
  /** 대상 환자 */
  patientIndication: string;
  /** 수술 내용 */
  surgeryDescription: string;
  /** 시행 근거 / 이유 */
  rationale: string;
  /** 주수술 급여 항목 */
  mainSurgeryCoverage: string;
  /** 특수 재료 별도 산정 여부 */
  specialMaterials?: string[];
  /** 근거 문헌 */
  evidence?: string;
  /** 주의사항 */
  warnings?: string[];
}

// ──────────────────────────────────────────────
// Data: 9개 동시수술 카테고리
// ──────────────────────────────────────────────

export const surgeryCategories: SurgeryCategory[] = [
  {
    id: "hto-dfo",
    section: "3.1",
    name: "슬관절 축 정렬 수술 (HTO·DFO)",
    nameEn: "HTO / DFO",
    patientIndication: "내반변형(O자) 또는 외반변형(X자) + ICRS IV 연골결손",
    surgeryDescription:
      "HTO(근위경골절골술) 또는 DFO(원위대퇴골절골술)를 시행하여 하지 축을 교정",
    rationale: "하지 축 교정 → 카티스템 생착률 개선",
    mainSurgeryCoverage: "HTO/DFO 급여, 마취료 100% 급여",
    evidence:
      "Kim SJ 2025 Stem Cell Research & Therapy (97.7% 재생률)",
  },
  {
    id: "meniscectomy",
    section: "3.2",
    name: "반월상연골 절제술",
    nameEn: "Meniscectomy",
    patientIndication: "반월상연골 파열 + 연골결손",
    surgeryDescription: "관절경하 내측/외측 반월상연골절제술",
    rationale: "손상된 반월상연골 제거로 관절 기능 회복 및 연골 치료 환경 조성",
    mainSurgeryCoverage: "반월상연골절제술 급여, 관절경 재료 급여",
    warnings: [
      "⚠ '카티스템 시야 확보 목적'이라는 표현 절대 금지 — 급여 인정 불가 사유가 됨",
    ],
  },
  {
    id: "meniscus-repair",
    section: "3.3",
    name: "반월상연골 봉합술 (Repair·Root Repair)",
    nameEn: "Meniscus Repair / Root Repair",
    patientIndication: "봉합 가능한 반월상연골 파열 또는 Root tear + 연골결손",
    surgeryDescription:
      "반월상연골 봉합술 또는 Root Repair를 시행하여 연골판 기능 보존",
    rationale: "반월상연골 기능 보존 → 관절 안정성 유지 및 연골 보호",
    mainSurgeryCoverage: "반월상연골 봉합술 급여",
    specialMaterials: [
      "Endoloop 별도 산정 가능",
      "Endosuture 별도 산정 가능",
      "Endoclip 별도 산정 가능",
    ],
    evidence:
      "LaPrade — 미치료시 5년 내 65% TKA(인공관절치환술) 진행",
  },
  {
    id: "meniscus-allograft",
    section: "3.4",
    name: "반월상연골 동종이식술 (MMAT·LMAT)",
    nameEn: "MMAT / LMAT",
    patientIndication:
      "반월상연골 결손 + 연골결손 (단, MAT 적응증 부위와 카티스템 적응 부위가 서로 다른 경우에만 양립 가능)",
    surgeryDescription: "내측(MMAT) 또는 외측(LMAT) 반월상연골 동종이식술",
    rationale: "결손된 반월상연골 대체 → 관절면 보호 및 연골 재생 환경 확보",
    mainSurgeryCoverage: "반월상연골 동종이식술 급여",
    warnings: [
      "⚠ MAT 적응증(Outerbridge I~II)과 카티스템 적응증(ICRS IV)은 동일 부위에서 상호모순",
      "⚠ 부위가 다를 때만 양립 가능 — 동일 부위 동시 적용 시 심사 거절 위험",
    ],
  },
  {
    id: "ligament-reconstruction",
    section: "3.5",
    name: "인대 재건술 (ACL·PCL·MPFL)",
    nameEn: "ACL / PCL / MPFL Reconstruction",
    patientIndication: "인대 손상 + 연골결손 (ACL 손상 환자의 30%에서 연골 손상 동반)",
    surgeryDescription:
      "전방십자인대(ACL), 후방십자인대(PCL), 또는 내측슬개대퇴인대(MPFL) 재건술",
    rationale: "관절 불안정성 해소 → 카티스템 이식 후 재생 환경 안정화",
    mainSurgeryCoverage: "인대 재건술 급여",
    specialMaterials: [
      "Interference screw 별도 급여",
      "Suture anchor 별도 급여",
      "EndoButton 별도 급여",
    ],
  },
  {
    id: "ocd-surgery",
    section: "3.6",
    name: "OCD 관련 수술",
    nameEn: "OCD (Osteochondritis Dissecans) Surgery",
    patientIndication: "이단성 골연골염(OCD) 환자 — 병기별 적응 구분 필요",
    surgeryDescription:
      "OCD 병기에 따라 Drilling, Fixation, Loose body removal, Microfracture 등을 시행",
    rationale:
      "OCD는 카티스템의 핵심 적응증이며, Stage IV에서 직접 적응(ICRS IV)에 해당",
    mainSurgeryCoverage: "OCD 관련 수술(Drilling, Fixation 등) 급여",
  },
  {
    id: "total-synovectomy",
    section: "3.7",
    name: "활액막 전절제술",
    nameEn: "Total Synovectomy",
    patientIndication: "활액막 질환(류마티스 관절염, PVNS 등) + 연골결손",
    surgeryDescription: "관절경하 활액막 전절제술(Total Synovectomy)",
    rationale: "병적 활액막 완전 제거 → 관절 내 환경 개선 및 연골 재생 조건 확보",
    mainSurgeryCoverage: "활액막 전절제술 급여",
    warnings: [
      "⚠ 부분활액막제거술(Partial Synovectomy)과 반드시 구분할 것",
      "⚠ 부분활액막제거술은 단독 급여 인정 불가",
    ],
  },
  {
    id: "loose-body-removal",
    section: "3.8",
    name: "유리체 제거술",
    nameEn: "Loose Body Removal",
    patientIndication: "관절 내 유리체 + 연골결손 (원인 수술 동반 시에만 정당화)",
    surgeryDescription: "관절경하 유리체(Loose Body) 제거술",
    rationale: "관절 내 유리체 제거 → 기계적 자극 원인 제거 및 연골 치료 환경 확보",
    mainSurgeryCoverage: "유리체 제거술 급여 (원인 수술 동반 시)",
    warnings: [
      "⚠ 단독 시행 시 급여 불인정",
      "⚠ OCD 등 원인 수술과 동반 시에만 정당화 가능",
    ],
  },
  {
    id: "combined-multiple",
    section: "3.9",
    name: "복합 다중 동시 시술",
    nameEn: "Combined Multiple Concurrent Procedures",
    patientIndication: "2가지 이상의 급여 수술 적응증이 동시에 존재하는 환자",
    surgeryDescription:
      "복수의 급여 수술을 동시에 시행 (예: HTO + 반월상연골봉합 + 카티스템)",
    rationale: "다발성 병변의 일괄 치료 → 수술 횟수 감소, 환자 부담 경감",
    mainSurgeryCoverage:
      "동시수술 체감 적용: 주수술 100% / 종속수술 의원 50%, 종합병원 70%",
    warnings: [
      "⚠ 카티스템은 비급여이므로 체감 미적용 — 별도 비급여 청구",
    ],
  },
];

// ──────────────────────────────────────────────
// Data: OCD 병기별 카티스템 적응
// ──────────────────────────────────────────────

export const ocdStages: OcdStage[] = [
  {
    stage: "I",
    description: "연골면 정상, 연골하골 변화만 존재",
    treatment: "보존적 치료 (활동 제한, 약물)",
    cartistemIndication: "적응 없음",
  },
  {
    stage: "II",
    description: "연골면 부분 손상, 골연골편 부분 분리",
    treatment: "Drilling 또는 Fixation",
    cartistemIndication: "일반적 적응 없음",
  },
  {
    stage: "III",
    description: "골연골편 완전 분리 but 제자리 위치",
    treatment: "Fixation + Microfracture",
    cartistemIndication: "보조 적응 가능",
  },
  {
    stage: "IV",
    description: "골연골편 완전 분리 및 전위 (유리체화)",
    treatment: "Loose body removal + Microfracture + 카티스템",
    cartistemIndication: "직접 적응 (ICRS IV)",
  },
];

// ──────────────────────────────────────────────
// Data: 부당청구 위험 패턴
// ──────────────────────────────────────────────

export const riskPatterns: RiskPattern[] = [
  {
    pattern: "부분활액막제거술 단독 급여 청구",
    description:
      "부분활액막제거술(Partial Synovectomy)만으로는 급여 동시수술 요건을 충족하지 못함. 전절제술(Total)과 혼동하여 청구 시 부당청구에 해당.",
    legalBasis: "국민건강보험법 제98조 (부당이득 징수)",
  },
  {
    pattern: "추벽제거술 단독 급여 청구",
    description:
      "추벽제거술(Plica Excision)을 단독 급여 수술로 청구하고 카티스템 동시수술 급여를 적용하는 것은 인정 불가.",
    legalBasis: "국민건강보험법 제98조 (부당이득 징수)",
  },
  {
    pattern: "이물제거술 단독 급여 청구",
    description:
      "이물제거술(Foreign Body Removal)을 단독으로 급여 청구하여 카티스템 동시수술 급여를 적용하는 것은 인정 불가.",
    legalBasis: "국민건강보험법 제98조 (부당이득 징수)",
  },
  {
    pattern: "코드 차용 (수술 코드 부정 사용)",
    description:
      "실제 시행하지 않은 급여 수술의 코드를 차용하여 카티스템 동시수술 급여를 받는 행위. 허위·부당청구의 가장 심각한 유형.",
    legalBasis: "국민건강보험법 제98조 (부당이득 징수) — 환수 + 가산금 부과, 업무정지 가능",
  },
];

// ──────────────────────────────────────────────
// Data: 의무기록 권장 vs 지양 표현
// ──────────────────────────────────────────────

export const medicalRecordGuides: MedicalRecordGuide[] = [
  {
    categoryId: "hto-dfo",
    recommended: [
      "내반변형에 의한 내측 구획 과부하로 연골 퇴행 진행, 축 교정 필요",
      "HTO 시행하여 역학적 축 정렬 교정 후 연골결손부 줄기세포 치료 병행",
      "ICRS Grade IV 연골결손 확인, 축 교정과 동시에 연골 재생술 시행",
    ],
    prohibited: [
      "카티스템을 위해 HTO 시행",
      "카티스템 급여 적용 목적으로 절골술 추가",
    ],
  },
  {
    categoryId: "meniscectomy",
    recommended: [
      "내측 반월상연골 복합 파열 확인, 봉합 불가능하여 부분절제술 시행",
      "반월상연골 변성 파열에 대한 부분절제술 시행, 동시에 확인된 연골결손부 치료",
      "관절경 소견상 반월상연골 파열 및 ICRS IV 연골결손 동시 확인",
    ],
    prohibited: [
      "카티스템 시야 확보 목적으로 반월상연골절제술 시행",
      "카티스템 적용을 위한 연골 노출 목적의 절제",
    ],
  },
  {
    categoryId: "meniscus-repair",
    recommended: [
      "반월상연골 종파열(longitudinal tear) 확인, Red-Red zone으로 봉합 시행",
      "Root tear 확인, Pull-out repair 시행 — 미치료 시 기능적 반월상연골 전절제 상태에 해당",
      "봉합술 시행 후 동일 관절 내 ICRS IV 연골결손에 대해 줄기세포 치료 병행",
    ],
    prohibited: [
      "카티스템과 함께 하기 위해 봉합술 시행",
      "급여 청구를 위한 봉합술",
    ],
  },
  {
    categoryId: "meniscus-allograft",
    recommended: [
      "내측 반월상연골 아전절제 상태(subtotal meniscectomy state)로 동종이식 적응",
      "MAT 적응 부위(내측)와 연골결손 부위(외측/슬개대퇴)가 상이하여 동시 시행 타당",
    ],
    prohibited: [
      "동일 구획에 MAT(Outerbridge I~II)와 카티스템(ICRS IV) 동시 적용",
      "MAT 부위와 카티스템 부위의 구분 없이 기술",
    ],
  },
  {
    categoryId: "ligament-reconstruction",
    recommended: [
      "ACL 파열로 인한 관절 불안정성 확인, 재건술 시행",
      "ACL 재건 시 관절경 소견상 내측 대퇴과 ICRS IV 연골결손 동시 확인, 줄기세포 치료 병행",
      "만성 ACL 부전에 동반된 이차적 연골 손상에 대해 동시 치료",
    ],
    prohibited: [
      "카티스템 급여를 위해 인대 재건 추가",
      "연골 치료 목적의 인대 재건",
    ],
  },
  {
    categoryId: "ocd-surgery",
    recommended: [
      "OCD Stage IV, 골연골편 완전 분리 및 유리체화 확인",
      "유리체 제거 후 결손부 microfracture 시행, 줄기세포 치료 병행",
      "OCD에 의한 ICRS Grade IV 전층 연골결손 확인",
    ],
    prohibited: [
      "OCD Stage I~II에서 카티스템 적용",
      "카티스템 사용을 위해 OCD 병기를 상향 기술",
    ],
  },
  {
    categoryId: "total-synovectomy",
    recommended: [
      "미만성 활액막 비후 확인, 전절제술(Total Synovectomy) 시행",
      "PVNS(색소융모결절성 활액막염) 진단하 관절경적 전활액막절제술 시행",
      "전절제술 시행 중 확인된 연골결손부에 대해 줄기세포 치료 병행",
    ],
    prohibited: [
      "부분활액막제거술을 전절제술로 기술",
      "경미한 활액막 염증에 대해 전절제술 기술",
    ],
  },
  {
    categoryId: "loose-body-removal",
    recommended: [
      "OCD에 의한 유리체 확인, 원인 병변(OCD Stage IV) 치료와 함께 유리체 제거",
      "유리체의 원인이 되는 골연골 병변에 대한 근본 치료와 동시 시행",
    ],
    prohibited: [
      "유리체 제거술만 단독으로 급여 청구",
      "원인 불명의 유리체 제거를 급여 수술로 기술",
    ],
  },
  {
    categoryId: "combined-multiple",
    recommended: [
      "각 수술의 독립적 적응증을 개별적으로 명확히 기술",
      "주수술과 종속수술의 구분을 명확히 기술",
      "카티스템은 비급여 항목으로 별도 기재",
    ],
    prohibited: [
      "카티스템 급여 적용을 위해 불필요한 수술 추가",
      "동시수술 체감을 피하기 위한 수술 분리 시행 (별도 일자 청구)",
    ],
  },
];
