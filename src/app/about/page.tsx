export default function AboutPage() {
  return (
    <div className="mx-auto max-w-4xl px-6 py-16">
      <h1 className="text-3xl font-bold">카티스템(CARTSTEM)이란?</h1>
      <p className="mt-4 text-lg leading-8 text-gray-600 dark:text-gray-400">
        카티스템(CARTSTEM)은 메디포스트가 개발한 동종 제대혈 유래
        중간엽줄기세포(hUCB-MSC) 치료제로, 퇴행성 관절염 또는 반복적 외상으로
        인한 무릎 관절 연골 결손을 재생하기 위해 사용됩니다. 2012년 한국
        식약처로부터 세계 최초로 동종 줄기세포 치료제 품목허가를 받았습니다.
      </p>

      <section className="mt-12">
        <h2 className="text-2xl font-semibold">핵심 원리</h2>
        <div className="mt-6 space-y-6">
          <div className="rounded-xl border border-gray-200 p-6 dark:border-gray-800">
            <h3 className="font-semibold text-[var(--primary)]">
              1. 동종 제대혈 유래 중간엽줄기세포 (hUCB-MSC)
            </h3>
            <p className="mt-2 text-sm leading-6 text-gray-600 dark:text-gray-400">
              카티스템은 기증받은 제대혈(탯줄 혈액)에서 분리한 중간엽줄기세포를
              사용합니다. 이 세포는 연골세포로 분화하는 능력이 뛰어나며,
              면역거부반응이 낮아 타인에게도 투여할 수 있는 동종(allogeneic)
              치료제입니다.
            </p>
          </div>
          <div className="rounded-xl border border-gray-200 p-6 dark:border-gray-800">
            <h3 className="font-semibold text-[var(--primary)]">
              2. 연골 분화 및 재생
            </h3>
            <p className="mt-2 text-sm leading-6 text-gray-600 dark:text-gray-400">
              투여된 줄기세포는 손상된 연골 부위에서 연골세포(chondrocyte)로
              분화하여 히알린 유사 연골(hyaline-like cartilage)을 형성합니다.
              이를 통해 결손 부위의 연골이 재생되어 관절 기능이 회복됩니다.
            </p>
          </div>
          <div className="rounded-xl border border-gray-200 p-6 dark:border-gray-800">
            <h3 className="font-semibold text-[var(--primary)]">
              3. 항염증 및 면역조절 효과
            </h3>
            <p className="mt-2 text-sm leading-6 text-gray-600 dark:text-gray-400">
              중간엽줄기세포는 다양한 항염증 인자를 분비하여 관절 내 염증을
              억제하고, 기존 연골 조직의 추가 손상을 방지하는 역할도 합니다.
              면역조절 기능을 통해 동종 세포임에도 면역거부반응을 최소화합니다.
            </p>
          </div>
        </div>
      </section>

      <section className="mt-12">
        <h2 className="text-2xl font-semibold">적응증</h2>
        <p className="mt-4 text-sm text-gray-600 dark:text-gray-400">
          카티스템의 허가된 적응증은 다음과 같습니다:
        </p>
        <ul className="mt-4 space-y-3">
          {[
            "퇴행성 관절염(골관절염)으로 인한 무릎 관절 연골 결손 (ICRS Grade IV)",
            "반복적 외상으로 인한 무릎 관절 연골 결손",
            "기존 보존적 치료(약물, 물리치료 등)에 반응하지 않는 무릎 연골 손상",
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
        <h2 className="text-2xl font-semibold">제품 정보</h2>
        <div className="mt-6 overflow-x-auto">
          <table className="w-full text-sm">
            <tbody className="text-gray-600 dark:text-gray-400">
              {[
                ["제품명", "카티스템 (CARTSTEM)"],
                ["일반명", "동종 제대혈 유래 중간엽줄기세포"],
                ["개발사", "메디포스트 (Medipost Co., Ltd.)"],
                ["허가 연도", "2012년 (한국 식약처)"],
                ["투여 경로", "관절경 수술을 통한 관절 내 투여"],
                ["투여 횟수", "1회 투여"],
                ["보조재", "히알루론산 하이드로겔과 함께 투여"],
                ["보관 조건", "-196°C 이하 액체질소 보관"],
              ].map(([label, value]) => (
                <tr
                  key={label}
                  className="border-b border-gray-100 dark:border-gray-800/50"
                >
                  <td className="px-4 py-3 font-medium text-foreground w-40">
                    {label}
                  </td>
                  <td className="px-4 py-3">{value}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="mt-12">
        <h2 className="text-2xl font-semibold">기존 치료법과의 비교</h2>
        <div className="mt-6 overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-800">
                <th className="px-4 py-3 text-left font-semibold">치료법</th>
                <th className="px-4 py-3 text-left font-semibold">특징</th>
                <th className="px-4 py-3 text-left font-semibold">한계</th>
              </tr>
            </thead>
            <tbody className="text-gray-600 dark:text-gray-400">
              {[
                [
                  "미세천공술",
                  "골수 자극으로 섬유연골 형성",
                  "히알린 연골이 아닌 섬유연골 생성",
                ],
                [
                  "자가 연골세포 이식",
                  "자기 연골세포 배양 후 이식",
                  "2회 수술 필요, 공여부 손상",
                ],
                [
                  "카티스템",
                  "동종 줄기세포로 히알린 유사 연골 재생",
                  "1회 수술, 공여부 손상 없음",
                ],
              ].map(([name, feature, limit]) => (
                <tr
                  key={name}
                  className="border-b border-gray-100 dark:border-gray-800/50"
                >
                  <td className="px-4 py-3 font-medium text-foreground">
                    {name}
                  </td>
                  <td className="px-4 py-3">{feature}</td>
                  <td className="px-4 py-3">{limit}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
