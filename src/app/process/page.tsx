const steps = [
  {
    step: 1,
    title: "환자 평가 및 선정",
    duration: "1~2주",
    description:
      "환자의 전반적인 건강 상태, 질환의 종류와 단계, 이전 치료 이력을 종합적으로 평가합니다. CAR-T 세포치료의 적합성을 판단하고 치료 계획을 수립합니다.",
    details: [
      "혈액검사, 골수검사, 영상검사 시행",
      "심폐기능 및 장기기능 평가",
      "감염 여부 확인",
      "치료 동의서 작성",
    ],
  },
  {
    step: 2,
    title: "T세포 채집 (백혈구 성분채집술)",
    duration: "3~6시간",
    description:
      "환자의 혈액에서 T세포를 포함한 백혈구를 선별적으로 채집합니다. 성분채집기를 통해 혈액을 순환시키며 필요한 세포만 분리합니다.",
    details: [
      "양팔 또는 중심정맥관을 통해 채집",
      "보통 1회 시행으로 충분한 세포 확보",
      "채집 후 즉시 제조시설로 운송",
      "환자는 당일 또는 다음날 퇴원 가능",
    ],
  },
  {
    step: 3,
    title: "CAR-T 세포 제조",
    duration: "2~4주",
    description:
      "채집된 T세포에 CAR 유전자를 도입하고 체외에서 대량 배양합니다. 엄격한 품질관리 과정을 거쳐 치료용 세포를 준비합니다.",
    details: [
      "바이러스 벡터를 이용한 CAR 유전자 도입",
      "배양기에서 세포 증식 (수억~수십억 개)",
      "품질검사: 생존율, CAR 발현율, 무균검사",
      "동결 보존 후 치료기관으로 운송",
    ],
  },
  {
    step: 4,
    title: "전처치 (림프구제거 화학요법)",
    duration: "3~5일",
    description:
      "CAR-T 세포 주입 전 환자의 기존 면역세포를 감소시키는 화학요법을 시행합니다. 이를 통해 주입된 CAR-T 세포가 효과적으로 증식할 수 있는 환경을 조성합니다.",
    details: [
      "플루다라빈 + 시클로포스파미드 병용 요법이 표준",
      "CAR-T 주입 2~7일 전에 시작",
      "입원하여 시행",
      "감염 예방을 위한 지지요법 병행",
    ],
  },
  {
    step: 5,
    title: "CAR-T 세포 주입",
    duration: "30분~1시간",
    description:
      "제조된 CAR-T 세포를 정맥주사로 환자에게 주입합니다. 주입 자체는 비교적 간단하지만, 이후 면밀한 모니터링이 필요합니다.",
    details: [
      "해동 후 30분 이내 주입 권장",
      "전처치 완료 2~14일 후 시행",
      "주입 중 활력징후 지속 모니터링",
      "아나필락시스 대비 응급약물 준비",
    ],
  },
  {
    step: 6,
    title: "모니터링 및 회복",
    duration: "2~4주 (입원) + 수개월 (외래)",
    description:
      "주입 후 최소 2~4주간 입원하여 부작용을 모니터링합니다. 퇴원 후에도 정기적인 외래 추적관찰이 필요합니다.",
    details: [
      "CRS, 신경독성 등 부작용 집중 관찰",
      "혈액검사를 통한 CAR-T 세포 증식 확인",
      "감염 예방 및 수혈 지지요법",
      "퇴원 후 1, 3, 6, 12개월 추적검사",
    ],
  },
];

export default function ProcessPage() {
  return (
    <div className="mx-auto max-w-4xl px-6 py-16">
      <h1 className="text-3xl font-bold">CAR-T 세포치료 과정</h1>
      <p className="mt-4 text-lg leading-8 text-gray-600 dark:text-gray-400">
        카티스템 치료는 크게 6단계로 진행됩니다. 전체 과정은 약 6~10주가
        소요되며, 환자 상태에 따라 달라질 수 있습니다.
      </p>

      <div className="mt-12 space-y-8">
        {steps.map((item) => (
          <div
            key={item.step}
            className="relative rounded-2xl border border-gray-200 p-8 dark:border-gray-800"
          >
            <div className="flex items-start gap-6">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-blue-600 text-lg font-bold text-white">
                {item.step}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-3">
                  <h2 className="text-xl font-semibold">{item.title}</h2>
                  <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-medium text-blue-700 dark:bg-blue-900/30 dark:text-blue-300">
                    {item.duration}
                  </span>
                </div>
                <p className="mt-3 text-sm leading-6 text-gray-600 dark:text-gray-400">
                  {item.description}
                </p>
                <ul className="mt-4 space-y-2">
                  {item.details.map((detail) => (
                    <li
                      key={detail}
                      className="flex items-start gap-2 text-sm text-gray-500 dark:text-gray-400"
                    >
                      <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-blue-400" />
                      {detail}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-12 rounded-2xl bg-amber-50 p-8 dark:bg-amber-950/20">
        <h3 className="font-semibold text-amber-800 dark:text-amber-300">
          ⚠️ 참고사항
        </h3>
        <p className="mt-2 text-sm leading-6 text-amber-700 dark:text-amber-400">
          위 과정은 일반적인 CAR-T 세포치료 흐름을 설명한 것이며, 실제 치료
          과정은 사용하는 제품, 치료기관, 환자 상태에 따라 달라질 수 있습니다.
          구체적인 치료 계획은 담당 의료진과 상담하시기 바랍니다.
        </p>
      </div>
    </div>
  );
}
