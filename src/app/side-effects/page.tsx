const sideEffects = [
  {
    name: "사이토카인 방출 증후군 (CRS)",
    severity: "중증 가능",
    frequency: "50~90%",
    onset: "주입 후 1~14일",
    description:
      "CAR-T 세포가 암세포를 공격하면서 대량의 사이토카인(면역물질)이 방출되어 발생합니다. 가장 흔하고 중요한 부작용입니다.",
    symptoms: [
      "고열 (38°C 이상)",
      "저혈압",
      "빈맥 (빠른 심박수)",
      "호흡곤란",
      "저산소증",
      "장기부전 (중증 시)",
    ],
    management: [
      "토실리주맙 (IL-6 수용체 차단제) 투여",
      "코르티코스테로이드 사용",
      "수액 및 승압제 투여",
      "산소 공급 및 필요시 중환자실 치료",
    ],
    gradeColor: "red",
  },
  {
    name: "면역 이펙터 세포 관련 신경독성 (ICANS)",
    severity: "중증 가능",
    frequency: "20~60%",
    onset: "주입 후 2~17일",
    description:
      "CAR-T 세포 치료 후 발생할 수 있는 신경학적 부작용으로, CRS와 함께 또는 이후에 나타날 수 있습니다.",
    symptoms: [
      "두통",
      "혼란/착란",
      "언어장애 (실어증)",
      "떨림, 경련",
      "의식 저하",
      "뇌부종 (드물게)",
    ],
    management: [
      "코르티코스테로이드 (덱사메타손) 투여",
      "항경련제 사용",
      "신경학적 검사 (ICE 점수) 반복 시행",
      "중증 시 중환자실 모니터링",
    ],
    gradeColor: "orange",
  },
  {
    name: "혈구감소증",
    severity: "흔함",
    frequency: "80~100%",
    onset: "전처치 후~수주",
    description:
      "전처치 화학요법과 CAR-T 세포의 면역 활동으로 인해 정상 혈구 수치가 감소합니다. 장기간 지속될 수 있습니다.",
    symptoms: [
      "호중구감소증 → 감염 위험 증가",
      "혈소판감소증 → 출혈 위험 증가",
      "빈혈 → 피로, 어지러움",
    ],
    management: [
      "G-CSF (과립구 집락자극인자) 투여",
      "수혈 (적혈구, 혈소판)",
      "감염 예방 항생제/항진균제",
      "정기적 혈액검사 모니터링",
    ],
    gradeColor: "yellow",
  },
  {
    name: "B세포 무형성증 / 저감마글로불린혈증",
    severity: "장기 부작용",
    frequency: "거의 100% (CD19 표적 시)",
    onset: "수주~수년 지속",
    description:
      "CD19를 표적으로 하는 CAR-T 세포는 암세포뿐만 아니라 정상 B세포도 함께 제거합니다. 이로 인해 항체 생성이 감소합니다.",
    symptoms: [
      "면역글로불린(IgG) 수치 감소",
      "반복적 감염 (상기도, 부비동 등)",
      "백신 반응 감소",
    ],
    management: [
      "정기적 면역글로불린 수치 검사",
      "필요시 면역글로불린 보충 (IVIG)",
      "감염 예방 교육",
      "장기 추적관찰",
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
        CAR-T 세포치료는 강력한 효과만큼 주의가 필요한 부작용이 동반될 수
        있습니다. 대부분의 부작용은 적절한 관리로 조절 가능하며, 경험 있는
        의료팀의 모니터링이 중요합니다.
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
          🚨 응급 상황 시
        </h3>
        <p className="mt-2 text-sm leading-6 text-red-700 dark:text-red-400">
          CAR-T 세포 주입 후 고열, 호흡곤란, 의식 변화, 경련 등의 증상이
          나타나면 즉시 의료팀에 연락하세요. CRS와 ICANS는 조기 발견 및 치료 시
          대부분 회복 가능합니다.
        </p>
      </div>
    </div>
  );
}
