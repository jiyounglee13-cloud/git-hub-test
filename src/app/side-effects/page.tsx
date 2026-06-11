const sideEffects = [
  {
    name: "수술 부위 통증 및 부종",
    severity: "흔함",
    frequency: "대부분의 환자",
    onset: "수술 직후~수주",
    description:
      "관절경 수술에 따른 일반적인 수술 후 반응입니다. 줄기세포 투여 부위와 수술 절개 부위에서 통증과 부종이 발생할 수 있습니다.",
    symptoms: [
      "무릎 부위 통증 및 압통",
      "관절 부종 (부기)",
      "관절 삼출액 증가",
      "수술 부위 열감",
    ],
    management: [
      "처방된 진통소염제 복용",
      "냉찜질 (수술 후 48~72시간)",
      "무릎 거상 및 안정",
      "압박 붕대 착용",
    ],
    gradeColor: "yellow",
  },
  {
    name: "관절 내 감염",
    severity: "드물지만 주의 필요",
    frequency: "1% 미만",
    onset: "수술 후 수일~수주",
    description:
      "관절경 수술 시 발생할 수 있는 감염으로, 조기 발견과 치료가 중요합니다. 무균적 수술 환경에서 시행되므로 발생 빈도는 낮습니다.",
    symptoms: [
      "지속적인 고열 (38°C 이상)",
      "수술 부위 발적 및 열감 증가",
      "심한 통증 악화",
      "관절 삼출액 증가 (탁한 액체)",
    ],
    management: [
      "즉시 담당 의료진에게 연락",
      "관절 천자를 통한 배양 검사",
      "적절한 항생제 투여",
      "필요시 관절경 세척술",
    ],
    gradeColor: "red",
  },
  {
    name: "관절 강직 / 운동 범위 감소",
    severity: "가능",
    frequency: "일부 환자",
    onset: "수술 후 수주~수개월",
    description:
      "수술 후 충분한 재활이 이루어지지 않거나, 관절 내 유착이 발생하면 무릎 관절의 움직임이 제한될 수 있습니다.",
    symptoms: [
      "무릎 굽힘/펴기 제한",
      "무릎 뻣뻣함",
      "일상 동작(계단 오르기, 쪼그려 앉기) 어려움",
    ],
    management: [
      "재활 프로그램 충실히 이행",
      "물리치료 (관절 운동 범위 회복 운동)",
      "지속적 수동 운동(CPM) 기기 사용",
      "심한 경우 관절경적 유착박리술 고려",
    ],
    gradeColor: "orange",
  },
  {
    name: "심부정맥혈전증 (DVT)",
    severity: "드물지만 주의 필요",
    frequency: "드묾",
    onset: "수술 후 수일~수주",
    description:
      "수술 후 활동 감소로 인해 하지 정맥에 혈전이 형성될 수 있습니다. 예방적 관리가 중요합니다.",
    symptoms: [
      "한쪽 다리(특히 종아리) 부종",
      "다리 통증 및 압통",
      "다리 피부 발적 및 열감",
      "호흡곤란 (폐색전증 시 - 응급)",
    ],
    management: [
      "조기 보행 및 발목 운동",
      "탄력 스타킹 착용",
      "필요시 항응고제 투여",
      "증상 발생 시 즉시 의료기관 방문",
    ],
    gradeColor: "blue",
  },
];

const gradeColorMap: Record<string, string> = {
  red: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300",
  orange:
    "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300",
  yellow:
    "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300",
  blue: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300",
};

export default function SideEffectsPage() {
  return (
    <div className="mx-auto max-w-4xl px-6 py-16">
      <h1 className="text-3xl font-bold">부작용 및 관리</h1>
      <p className="mt-4 text-lg leading-8 text-gray-600 dark:text-gray-400">
        카티스템 치료는 관절경 수술을 통해 이루어지므로, 수술 관련 일반적인
        부작용이 발생할 수 있습니다. 줄기세포 자체의 부작용은 매우 드물며,
        대부분의 부작용은 적절한 관리로 회복 가능합니다.
      </p>

      <div className="mt-12 space-y-10">
        {sideEffects.map((effect) => (
          <div
            key={effect.name}
            className="rounded-2xl border border-gray-200 p-8 dark:border-gray-800"
          >
            <div className="flex flex-wrap items-center gap-3">
              <h2 className="text-xl font-semibold">{effect.name}</h2>
              <span
                className={`rounded-full px-3 py-1 text-xs font-medium ${gradeColorMap[effect.gradeColor]}`}
              >
                {effect.severity}
              </span>
            </div>

            <div className="mt-3 flex gap-6 text-sm text-gray-500 dark:text-gray-400">
              <span>
                <strong>발생 빈도:</strong> {effect.frequency}
              </span>
              <span>
                <strong>발생 시기:</strong> {effect.onset}
              </span>
            </div>

            <p className="mt-4 text-sm leading-6 text-gray-600 dark:text-gray-400">
              {effect.description}
            </p>

            <div className="mt-6 grid gap-6 sm:grid-cols-2">
              <div>
                <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-200">
                  주요 증상
                </h3>
                <ul className="mt-2 space-y-1.5">
                  {effect.symptoms.map((s) => (
                    <li
                      key={s}
                      className="flex items-start gap-2 text-sm text-gray-500 dark:text-gray-400"
                    >
                      <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-gray-400" />
                      {s}
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-200">
                  관리 방법
                </h3>
                <ul className="mt-2 space-y-1.5">
                  {effect.management.map((m) => (
                    <li
                      key={m}
                      className="flex items-start gap-2 text-sm text-gray-500 dark:text-gray-400"
                    >
                      <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-green-400" />
                      {m}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-12 rounded-2xl bg-red-50 p-8 dark:bg-red-950/20">
        <h3 className="font-semibold text-red-800 dark:text-red-300">
          🚨 즉시 병원 방문이 필요한 경우
        </h3>
        <p className="mt-2 text-sm leading-6 text-red-700 dark:text-red-400">
          수술 후 38°C 이상의 발열, 수술 부위의 심한 발적과 열감, 급격한 통증
          악화, 다리 부종과 호흡곤란이 나타나면 즉시 담당 의료진에게
          연락하거나 가까운 응급실을 방문하세요.
        </p>
      </div>
    </div>
  );
}
