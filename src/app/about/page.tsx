export default function AboutPage() {
  return (
    <div className="mx-auto max-w-4xl px-6 py-16">
      <h1 className="text-3xl font-bold">CAR-T 세포치료란?</h1>
      <p className="mt-4 text-lg leading-8 text-gray-600 dark:text-gray-400">
        CAR-T(Chimeric Antigen Receptor T-cell) 세포치료는 환자의 T세포를
        유전공학적으로 변형하여 암세포를 인식하고 공격할 수 있도록 만드는
        혁신적인 면역항암 치료법입니다.
      </p>

      <section className="mt-12">
        <h2 className="text-2xl font-semibold">핵심 원리</h2>
        <div className="mt-6 space-y-6">
          <div className="rounded-xl border border-gray-200 p-6 dark:border-gray-800">
            <h3 className="font-semibold text-[var(--primary)]">
              1. 키메라 항원 수용체 (CAR)
            </h3>
            <p className="mt-2 text-sm leading-6 text-gray-600 dark:text-gray-400">
              CAR는 T세포 표면에 인공적으로 부착하는 수용체입니다. 이 수용체는
              암세포 표면의 특정 항원(예: CD19)을 인식하도록 설계되어, T세포가
              암세포만을 정확하게 찾아 공격할 수 있게 합니다.
            </p>
          </div>
          <div className="rounded-xl border border-gray-200 p-6 dark:border-gray-800">
            <h3 className="font-semibold text-[var(--primary)]">
              2. T세포의 재프로그래밍
            </h3>
            <p className="mt-2 text-sm leading-6 text-gray-600 dark:text-gray-400">
              환자로부터 채취한 T세포에 바이러스 벡터를 이용해 CAR 유전자를
              도입합니다. 변형된 T세포는 체외에서 대량 배양된 후 환자에게
              재주입됩니다.
            </p>
          </div>
          <div className="rounded-xl border border-gray-200 p-6 dark:border-gray-800">
            <h3 className="font-semibold text-[var(--primary)]">
              3. 면역 기억 형성
            </h3>
            <p className="mt-2 text-sm leading-6 text-gray-600 dark:text-gray-400">
              주입된 CAR-T 세포는 체내에서 증식하며, 일부는 기억 T세포로
              전환되어 장기적인 면역 감시 기능을 수행합니다. 이를 통해 암의
              재발을 방지하는 효과가 기대됩니다.
            </p>
          </div>
        </div>
      </section>

      <section className="mt-12">
        <h2 className="text-2xl font-semibold">적응증</h2>
        <p className="mt-4 text-sm text-gray-600 dark:text-gray-400">
          현재 CAR-T 세포치료가 승인된 주요 질환은 다음과 같습니다:
        </p>
        <ul className="mt-4 space-y-3">
          {[
            "재발성/불응성 B세포 급성 림프구성 백혈병 (ALL)",
            "재발성/불응성 미만성 거대B세포 림프종 (DLBCL)",
            "재발성/불응성 여포성 림프종 (FL)",
            "재발성/불응성 맨틀세포 림프종 (MCL)",
            "재발성/불응성 다발성 골수종 (MM)",
          ].map((item) => (
            <li
              key={item}
              className="flex items-start gap-3 text-sm leading-6 text-gray-600 dark:text-gray-400"
            >
              <span className="mt-1 text-[var(--primary)]">●</span>
              {item}
            </li>
          ))}
        </ul>
      </section>

      <section className="mt-12">
        <h2 className="text-2xl font-semibold">승인된 주요 CAR-T 제품</h2>
        <div className="mt-6 overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-800">
                <th className="px-4 py-3 text-left font-semibold">제품명</th>
                <th className="px-4 py-3 text-left font-semibold">제조사</th>
                <th className="px-4 py-3 text-left font-semibold">표적 항원</th>
                <th className="px-4 py-3 text-left font-semibold">승인 연도</th>
              </tr>
            </thead>
            <tbody className="text-gray-600 dark:text-gray-400">
              {[
                ["Kymriah (킴리아)", "Novartis", "CD19", "2017"],
                ["Yescarta (예스카타)", "Gilead/Kite", "CD19", "2017"],
                ["Tecartus (테카르투스)", "Gilead/Kite", "CD19", "2020"],
                ["Breyanzi (브레얀지)", "BMS/Juno", "CD19", "2021"],
                ["Abecma (아벡마)", "BMS/2seventy", "BCMA", "2021"],
                ["Carvykti (카빅티)", "J&J/Legend", "BCMA", "2022"],
              ].map(([name, company, target, year]) => (
                <tr
                  key={name}
                  className="border-b border-gray-100 dark:border-gray-800/50"
                >
                  <td className="px-4 py-3 font-medium text-foreground">
                    {name}
                  </td>
                  <td className="px-4 py-3">{company}</td>
                  <td className="px-4 py-3">{target}</td>
                  <td className="px-4 py-3">{year}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
