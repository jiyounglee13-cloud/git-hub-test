import {
  surgeryCategories,
  ocdStages,
  riskPatterns,
  medicalRecordGuides,
} from "@/lib/billing-data";

export default function BillingPage() {
  return (
    <div className="mx-auto max-w-4xl px-6 py-10">
      <h1 className="text-2xl font-bold">📋 급여 청구 가이드</h1>
      <p className="mt-2 text-sm text-gray-500">
        카티스템 동반 급여 수술 9개 분류 · OCD 케이스 · 의무기록 작성 가이드 ·
        부당청구 위험 패턴 (의료진용 v2.0)
      </p>

      <div className="mt-6 rounded-xl border border-blue-200 bg-blue-50 p-5 dark:border-blue-900 dark:bg-blue-950/20">
        <h3 className="text-sm font-bold text-blue-800 dark:text-blue-300">
          핵심 명제 — 카티스템 자체는 비급여이지만
        </h3>
        <p className="mt-2 text-sm leading-6 text-blue-700 dark:text-blue-400">
          카티스템과 동시에 시행되는 정식 급여 수술이 주수술의 지위를 가질 때,
          마취료·수술실 사용료·관절경 치료재료대·입원료가 모두 건강보험 급여로
          청구됩니다. 환자 부담 100~200만원의 비급여 부대비용이 건강보험
          본인부담분(통상 20%)으로 축소됩니다.
        </p>
        <div className="mt-3 grid grid-cols-2 gap-2 text-xs sm:grid-cols-4">
          <div className="rounded-lg bg-white p-2 text-center dark:bg-blue-900/20">
            <p className="font-bold text-blue-600">카티스템 약가</p>
            <p className="text-gray-600 dark:text-gray-400">1,000만원 (비급여)</p>
          </div>
          <div className="rounded-lg bg-white p-2 text-center dark:bg-blue-900/20">
            <p className="font-bold text-blue-600">적응증</p>
            <p className="text-gray-600 dark:text-gray-400">ICRS IV 연골결손</p>
          </div>
          <div className="rounded-lg bg-white p-2 text-center dark:bg-blue-900/20">
            <p className="font-bold text-blue-600">동시수술 체감</p>
            <p className="text-gray-600 dark:text-gray-400">주 100% / 종속 50~70%</p>
          </div>
          <div className="rounded-lg bg-white p-2 text-center dark:bg-blue-900/20">
            <p className="font-bold text-blue-600">마취료</p>
            <p className="text-gray-600 dark:text-gray-400">주수술 급여 시 100%</p>
          </div>
        </div>
      </div>

      <section className="mt-10">
        <h2 className="mb-6 text-lg font-bold">
          급여 청구 가능 동반 수술 — 9개 분류
        </h2>
        <div className="space-y-4">
          {surgeryCategories.map((cat) => (
            <details
              key={cat.id}
              className="rounded-xl border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900"
            >
              <summary className="flex cursor-pointer items-center gap-4 p-5">
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-teal-100 font-mono text-xs font-bold text-teal-700 dark:bg-teal-900 dark:text-teal-300">
                  {cat.section}
                </span>
                <div className="flex-1">
                  <p className="text-sm font-bold">{cat.name}</p>
                  <p className="text-xs text-gray-500">{cat.nameEn}</p>
                </div>
              </summary>
              <div className="space-y-3 border-t border-gray-100 p-5 text-sm dark:border-gray-800">
                <div>
                  <p className="text-xs font-bold text-gray-500">적응 환자</p>
                  <p className="text-gray-700 dark:text-gray-300">
                    {cat.patientIndication}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-bold text-gray-500">수술 내용</p>
                  <p className="text-gray-700 dark:text-gray-300">
                    {cat.surgeryDescription}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-bold text-gray-500">의학적 정합성</p>
                  <p className="text-gray-700 dark:text-gray-300">
                    {cat.rationale}
                  </p>
                </div>
                <div className="rounded-lg bg-teal-50 p-3 dark:bg-teal-950/20">
                  <p className="text-xs font-bold text-teal-700">주수술 급여 항목</p>
                  <p className="text-xs text-teal-600">{cat.mainSurgeryCoverage}</p>
                </div>
                {cat.specialMaterials && cat.specialMaterials.length > 0 && (
                  <div className="rounded-lg bg-gray-50 p-3 dark:bg-gray-800">
                    <p className="text-xs font-bold text-gray-500">특수 재료 산정</p>
                    {cat.specialMaterials.map((m) => (
                      <p key={m} className="text-xs text-gray-600 dark:text-gray-400">
                        • {m}
                      </p>
                    ))}
                  </div>
                )}
                {cat.warnings && cat.warnings.length > 0 && (
                  <div className="rounded-lg bg-red-50 p-3 dark:bg-red-950/20">
                    <p className="text-xs font-bold text-red-600">⚠️ 주의</p>
                    {cat.warnings.map((w) => (
                      <p key={w} className="text-xs text-red-600">{w}</p>
                    ))}
                  </div>
                )}
                {cat.evidence && (
                  <div className="rounded-lg bg-blue-50 p-3 dark:bg-blue-950/20">
                    <p className="text-xs font-bold text-blue-600">임상 근거</p>
                    <p className="text-xs text-blue-600">{cat.evidence}</p>
                  </div>
                )}
              </div>
            </details>
          ))}
        </div>
      </section>

      <section className="mt-10">
        <h2 className="mb-4 text-lg font-bold">OCD (박리성 골연골염) 단계별</h2>
        <p className="mb-4 text-sm text-gray-500">
          OCD는 카티스템의 핵심 적응증 중 하나입니다. Stage IV에서 ICRS IV 연골결손이
          형성되어 카티스템 허가 적응증과 직접 부합합니다.
        </p>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-700">
                <th className="px-3 py-2 text-left text-xs font-bold text-gray-500">Stage</th>
                <th className="px-3 py-2 text-left text-xs font-bold text-gray-500">소견</th>
                <th className="px-3 py-2 text-left text-xs font-bold text-gray-500">권장 처치</th>
                <th className="px-3 py-2 text-left text-xs font-bold text-gray-500">카티스템</th>
              </tr>
            </thead>
            <tbody>
              {ocdStages.map((stage) => (
                <tr
                  key={stage.stage}
                  className="border-b border-gray-100 dark:border-gray-800"
                >
                  <td className="px-3 py-3 font-bold">{stage.stage}</td>
                  <td className="px-3 py-3 text-gray-600 dark:text-gray-400">
                    {stage.description}
                  </td>
                  <td className="px-3 py-3 text-gray-600 dark:text-gray-400">
                    {stage.treatment}
                  </td>
                  <td className="px-3 py-3">
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs font-bold ${
                        stage.cartistemIndication.includes("직접")
                          ? "bg-green-100 text-green-700"
                          : stage.cartistemIndication.includes("가능")
                            ? "bg-amber-100 text-amber-700"
                            : "bg-gray-100 text-gray-500"
                      }`}
                    >
                      {stage.cartistemIndication}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="mt-10">
        <h2 className="mb-4 text-lg font-bold">의무기록 — 권장 vs 지양 표현</h2>
        <div className="space-y-3">
          {medicalRecordGuides.map((guide) => (
            <div
              key={guide.categoryId}
              className="rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-900"
            >
              <p className="mb-2 text-sm font-bold">{guide.categoryId}</p>
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-lg bg-green-50 p-3 dark:bg-green-950/20">
                  <p className="mb-1 text-[10px] font-bold text-green-700">
                    ✓ 권장 표현
                  </p>
                  {guide.recommended.map((r) => (
                    <p key={r} className="text-xs text-green-800 dark:text-green-300">
                      • {r}
                    </p>
                  ))}
                </div>
                <div className="rounded-lg bg-red-50 p-3 dark:bg-red-950/20">
                  <p className="mb-1 text-[10px] font-bold text-red-700">
                    ✕ 지양 표현
                  </p>
                  {guide.prohibited.map((p) => (
                    <p key={p} className="text-xs text-red-800 dark:text-red-300">
                      • {p}
                    </p>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-10">
        <h2 className="mb-4 text-lg font-bold text-red-600">
          🚨 부당청구 위험 패턴
        </h2>
        <div className="space-y-3">
          {riskPatterns.map((risk) => (
            <div
              key={risk.pattern}
              className="rounded-xl border border-red-200 bg-red-50 p-4 dark:border-red-900 dark:bg-red-950/20"
            >
              <p className="text-sm font-bold text-red-700 dark:text-red-400">
                {risk.pattern}
              </p>
              <p className="mt-2 text-sm text-red-600 dark:text-red-400">
                {risk.description}
              </p>
              <p className="mt-1 text-xs text-red-500">{risk.legalBasis}</p>
            </div>
          ))}
        </div>
      </section>

      <div className="mt-10 rounded-xl bg-gray-100 p-5 text-center text-xs leading-5 text-gray-500 dark:bg-gray-900">
        <p className="font-semibold">면책 조항</p>
        <p className="mt-1">
          본 문서는 보건복지부 고시 및 건강보험심사평가원 공식 자료에 근거한 사실
          정리이며, 최종 청구 책임은 의료기관에 있습니다.
        </p>
        <p className="mt-1 text-gray-400">
          문서 버전 v2.0 · 준거 법령: 보건복지부 고시 제2024-227호
        </p>
      </div>
    </div>
  );
}
