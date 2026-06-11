const steps = [
  {
    step: 1,
    title: "진단 및 환자 선정",
    duration: "1~2주",
    description:
      "정형외과 전문의가 무릎 관절 연골 손상의 정도와 범위를 평가합니다. MRI 검사, X-ray, 임상 소견을 종합하여 카티스템 치료의 적합성을 판단합니다.",
    details: [
      "MRI를 통한 연골 결손 부위 및 등급 확인 (ICRS Grade IV)",
      "X-ray로 관절 간격 및 골관절염 정도 평가",
      "기존 보존적 치료(약물, 물리치료) 반응 이력 확인",
      "환자 전반적 건강 상태 및 수술 적합성 평가",
    ],
  },
  {
    step: 2,
    title: "수술 전 준비",
    duration: "1~2주",
    description:
      "수술 전 필요한 검사를 시행하고, 카티스템 제품을 의료기관에 주문합니다. 환자에게 수술 과정과 주의사항을 안내합니다.",
    details: [
      "수술 전 혈액검사, 심전도, 흉부 X-ray 등 시행",
      "카티스템 제품 주문 및 배송 확인",
      "수술 동의서 작성 및 환자 교육",
      "항응고제 등 복용 약물 조정",
    ],
  },
  {
    step: 3,
    title: "관절경 수술 및 카티스템 투여",
    duration: "1~2시간",
    description:
      "관절경 수술을 통해 손상된 연골 부위를 정리한 후, 카티스템(줄기세포)을 히알루론산 하이드로겔과 함께 결손 부위에 투여합니다.",
    details: [
      "전신마취 또는 척추마취 하에 시행",
      "관절경으로 연골 결손 부위 확인 및 변연절제술 시행",
      "카티스템 해동 후 히알루론산 겔과 혼합",
      "결손 부위에 줄기세포-겔 복합체를 도포 및 충전",
      "피브린 글루(fibrin glue)로 고정",
    ],
  },
  {
    step: 4,
    title: "입원 및 초기 회복",
    duration: "3~7일",
    description:
      "수술 후 입원하여 경과를 관찰합니다. 투여된 줄기세포가 안정적으로 자리잡을 수 있도록 초기에는 무릎 관절 움직임을 제한합니다.",
    details: [
      "수술 부위 냉찜질 및 거상",
      "통증 관리 (진통제 투여)",
      "DVT(심부정맥혈전증) 예방",
      "보조기 착용 및 목발 보행 교육",
    ],
  },
  {
    step: 5,
    title: "재활 치료",
    duration: "6~12주",
    description:
      "단계적 재활 프로그램을 통해 무릎 관절의 기능을 회복합니다. 줄기세포가 연골로 분화하고 성숙하는 동안 적절한 자극과 보호가 필요합니다.",
    details: [
      "0~6주: 제한적 관절 운동(ROM), 부분 체중 부하",
      "6~12주: 점진적 체중 부하 증가, 근력 강화 운동",
      "수영, 고정식 자전거 등 저충격 운동부터 시작",
      "물리치료사와 함께 맞춤형 재활 프로그램 진행",
    ],
  },
  {
    step: 6,
    title: "장기 추적관찰",
    duration: "6개월~수년",
    description:
      "정기적인 외래 방문과 MRI 검사를 통해 연골 재생 상태를 확인합니다. 완전한 연골 재생까지 약 1~2년이 소요됩니다.",
    details: [
      "수술 후 3, 6, 12개월 정기 외래 방문",
      "MRI를 통한 연골 재생 상태 평가",
      "일상생활 및 운동 복귀 시기 조정",
      "필요시 추가 물리치료 또는 보조치료",
    ],
  },
];

export default function ProcessPage() {
  return (
    <div className="mx-auto max-w-4xl px-6 py-16">
      <h1 className="text-3xl font-bold">카티스템 치료 과정</h1>
      <p className="mt-4 text-lg leading-8 text-gray-600 dark:text-gray-400">
        카티스템 치료는 크게 6단계로 진행됩니다. 수술 자체는 1~2시간이지만,
        진단부터 연골 재생 완료까지 전체 과정은 약 1~2년이 소요됩니다.
      </p>

      <div className="mt-12 space-y-8">
        {steps.map((item) => (
          <div
            key={item.step}
            className="relative rounded-2xl border border-gray-200 p-8 dark:border-gray-800"
          >
            <div className="flex items-start gap-6">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-teal-600 text-lg font-bold text-white">
                {item.step}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-3">
                  <h2 className="text-xl font-semibold">{item.title}</h2>
                  <span className="rounded-full bg-teal-100 px-3 py-1 text-xs font-medium text-teal-700 dark:bg-teal-900/30 dark:text-teal-300">
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
                      <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-teal-400" />
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
          위 과정은 일반적인 카티스템 치료 흐름을 설명한 것이며, 실제 치료
          과정은 연골 결손의 크기, 위치, 환자 상태에 따라 달라질 수 있습니다.
          구체적인 치료 계획은 담당 정형외과 전문의와 상담하시기 바랍니다.
        </p>
      </div>
    </div>
  );
}
