"use client";

import { useState } from "react";

const insuranceGenerations = [
  {
    gen: "1~2세대",
    period: "~2009.9",
    icon: "🏛️",
    color: "#c87214",
    nonCoveredRate: "100%",
    limit: "제한 없음 (일부 한도 약관 차이)",
    selfPay: "없음~일부",
    feature:
      "비급여 전액 보장 구조. 카티스템 약가·부대비용 전액 보상 가능성 높음. 가장 유리한 세대.",
    cartstem:
      "카티스템 약가 + 비급여 부대비용 전액 보상 사례 다수. 단, 개별 약관 확인 필수.",
  },
  {
    gen: "3세대",
    period: "2009.10~2017.3",
    icon: "📋",
    color: "#2563eb",
    nonCoveredRate: "80%",
    limit: "연간 한도 있음 (약관별 상이)",
    selfPay: "20%",
    feature:
      "비급여 별도 특약 구조 도입 시작. 비급여 보장 특약 가입 여부에 따라 보장 범위 차이.",
    cartstem:
      "비급여 특약 가입 시 카티스템 보장 가능. 미가입 시 보장 불가. 약관 확인 필수.",
  },
  {
    gen: "4세대",
    period: "2017.4~2021.6",
    icon: "📊",
    color: "#168f57",
    nonCoveredRate: "70~80%",
    limit: "비급여 도수·주사·MRI 별도 한도",
    selfPay: "20~30%",
    feature:
      "비급여 3대 항목(도수·주사·MRI) 별도 특약 분리. 카티스템은 '3대 비급여'가 아닌 수술 항목.",
    cartstem:
      "수술비 특약 기준 보장. 3대 비급여 한도와 별개 산정. 보험사별 해석 차이 존재.",
  },
  {
    gen: "5세대",
    period: "2021.7~",
    icon: "🆕",
    color: "#6354cf",
    nonCoveredRate: "50~70%",
    limit: "비중증 비급여 50% / 1,000만원 한도",
    selfPay: "30~50%",
    feature:
      "비급여를 중증/비중증으로 분류. 카티스템은 비중증 비급여로 분류될 가능성. 2026.5.6 출시 최신 구조.",
    cartstem:
      "비중증 비급여 50%, 연간 1,000만원 한도 적용 가능성. 카티스템 약가(1,000만원) 고려 시 한도 초과 주의.",
  },
];

const denialSlots = [
  {
    slot: "S1",
    reason: "치료목적·필요성 미인정",
    signal: '"꼭 필요한 치료가 아니래요"',
    canFix: true,
    action: "담당자+의료진",
    detail:
      "의사 소견서 보완 — ICRS grade IV 연골결손 진단, 보존치료 실패 이력, 카티스템의 의학적 당위성을 객관적으로 기술. MRI 판독지 첨부.",
  },
  {
    slot: "S2",
    reason: "가입담보·특약 범위 밖",
    signal: '"내 보험으론 안 된대요"',
    canFix: false,
    action: "보험사+담당자",
    detail:
      "가입 당시 약관상 비급여 수술 보장 특약 미가입이 원인. 보완 여지가 거의 없으며, 약관 원문 확인 후 분쟁조정 가능성만 안내.",
  },
  {
    slot: "S3",
    reason: "입원 적정성 불인정",
    signal: '"통원만 된대요"',
    canFix: true,
    action: "담당자+의료진",
    detail:
      "입원 필요성 소견서 보완 — 마취 방식(전신/척추), 수술 후 관절 보호 필요성, 통원 시 합병증 위험을 의학적으로 기술.",
  },
  {
    slot: "S4",
    reason: "비급여 항목 적정성·삭감",
    signal: '"금액 깎였어요"',
    canFix: true,
    action: "담당자+원무",
    detail:
      "비급여 세부내역서 재확인 — 각 비급여 항목(약제·재료·수술실·마취)의 적정성을 항목별로 소명. 비급여 가격 공시 기준 제시.",
  },
  {
    slot: "S5",
    reason: "진단·청구내역 불일치",
    signal: '"서류가 안 맞는대요"',
    canFix: null,
    action: "의사+담당자",
    detail:
      "진단서, 수술확인서, 영수증의 진단명·수술명·일자 일치 여부 확인. 불일치 시 서류 재발급. 사실관계 확인이 우선.",
  },
  {
    slot: "S6",
    reason: "서류 미비·소멸시효",
    signal: '"서류 빠졌대요"',
    canFix: true,
    action: "원무+담당자",
    detail:
      "누락 서류 재발급 — 진단서, 수술확인서, 비급여 세부내역서, 입퇴원확인서. 청구 시효(3년) 확인.",
  },
];

const requiredDocs = [
  { doc: "진단서", content: "ICRS grade IV 무릎 연골결손 명시, 결손 면적, 시술의 의학적 당위성" },
  { doc: "수술확인서", content: "시행 수술명 (카티스템 시술), 시행 일자, 마취 방식" },
  { doc: "비급여 진료비 영수증", content: "법정 양식에 따른 비급여 항목 명세" },
  { doc: "비급여 진료비 세부내역서", content: "카티스템 약제비 및 비급여 부대비용의 세부 내역" },
  { doc: "입퇴원확인서", content: "입원 일자 및 입원 사유" },
  { doc: "MRI 판독지", content: "연골 결손의 객관적 영상 근거 (보험사 요청 시)" },
];

export default function InsurancePage() {
  const [activeGen, setActiveGen] = useState<string | null>(null);

  return (
    <div className="mx-auto max-w-4xl px-6 py-10">
      <h1 className="text-2xl font-bold">🛡️ 실손보험 안내</h1>
      <p className="mt-2 text-sm text-gray-500">
        실손 세대별 보장 구조, 청구 서류, 거절 대응 6슬롯 체계를 안내합니다.
      </p>

      <div className="mt-6 rounded-xl border border-amber-200 bg-amber-50 p-4 dark:border-amber-900 dark:bg-amber-950/20">
        <p className="text-sm font-semibold text-amber-800 dark:text-amber-300">
          🔑 핵심 구분 — 카티스템 ≠ 무릎 줄기세포 &apos;주사&apos;
        </p>
        <p className="mt-1 text-xs leading-5 text-amber-700 dark:text-amber-400">
          언론·금감원 경보의 &apos;무릎 줄기세포 주사&apos;는 대부분 2023 신의료기술
          자가 골수흡인물 주사(BMAC)로, 카티스템(2012 허가 전문의약품·수술)과
          별개입니다. 카티스템 실손 쟁점은 비급여 수술·약제·재료의
          치료목적/적정성/입원 필요성 중심입니다.
        </p>
      </div>

      <section className="mt-10">
        <h2 className="mb-4 text-lg font-bold">세대별 실손보험 구조</h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {insuranceGenerations.map((g) => (
            <button
              key={g.gen}
              onClick={() => setActiveGen(activeGen === g.gen ? null : g.gen)}
              className={`rounded-xl border p-4 text-left shadow-sm transition-all ${
                activeGen === g.gen
                  ? "border-2 shadow-md"
                  : "border-gray-200 hover:shadow dark:border-gray-700"
              }`}
              style={
                activeGen === g.gen
                  ? { borderColor: g.color }
                  : undefined
              }
            >
              <span className="text-2xl">{g.icon}</span>
              <p className="mt-2 text-sm font-bold">{g.gen}</p>
              <p className="text-[10px] text-gray-400">{g.period}</p>
            </button>
          ))}
        </div>

        {activeGen && (() => {
          const g = insuranceGenerations.find((x) => x.gen === activeGen)!;
          return (
            <div
              className="mt-4 rounded-xl border-l-4 bg-white p-5 shadow dark:bg-gray-900"
              style={{ borderLeftColor: g.color }}
            >
              <h3 className="text-base font-bold">{g.gen} ({g.period})</h3>
              <div className="mt-3 grid gap-2 text-sm">
                <div className="flex gap-3">
                  <span className="w-24 shrink-0 font-semibold text-gray-500">비급여 보장</span>
                  <span>{g.nonCoveredRate}</span>
                </div>
                <div className="flex gap-3">
                  <span className="w-24 shrink-0 font-semibold text-gray-500">한도</span>
                  <span>{g.limit}</span>
                </div>
                <div className="flex gap-3">
                  <span className="w-24 shrink-0 font-semibold text-gray-500">자기부담</span>
                  <span>{g.selfPay}</span>
                </div>
              </div>
              <p className="mt-3 text-sm leading-6 text-gray-600 dark:text-gray-400">
                {g.feature}
              </p>
              <div className="mt-3 rounded-lg bg-teal-50 p-3 dark:bg-teal-950/20">
                <p className="text-xs font-bold text-teal-700">카티스템 적용</p>
                <p className="mt-1 text-xs text-teal-600 dark:text-teal-400">
                  {g.cartstem}
                </p>
              </div>
            </div>
          );
        })()}
      </section>

      <section className="mt-10">
        <h2 className="mb-4 text-lg font-bold">📄 청구 필요 서류</h2>
        <div className="space-y-2">
          {requiredDocs.map((d) => (
            <div
              key={d.doc}
              className="flex gap-4 rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-900"
            >
              <span className="w-36 shrink-0 text-sm font-semibold">{d.doc}</span>
              <span className="text-sm text-gray-500">{d.content}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-10">
        <h2 className="mb-4 text-lg font-bold">🛡️ 거절 대응 — 6슬롯 체계</h2>
        <p className="mb-4 text-xs text-gray-500">
          거절 안내문의 &apos;사유&apos;를 확인 → 아래 슬롯으로 분류 → 실손 담당자
          인계까지만. 결과는 약속하지 않는다.
        </p>

        <div className="space-y-3">
          {denialSlots.map((s) => (
            <details
              key={s.slot}
              className="rounded-xl border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900"
            >
              <summary className="flex cursor-pointer items-center gap-4 p-4">
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-amber-100 font-mono text-xs font-bold text-amber-700">
                  {s.slot}
                </span>
                <div className="flex-1">
                  <p className="text-sm font-semibold">{s.reason}</p>
                  <p className="text-xs text-gray-400">{s.signal}</p>
                </div>
                <span
                  className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                    s.canFix === true
                      ? "bg-green-100 text-green-700"
                      : s.canFix === false
                        ? "bg-red-100 text-red-700"
                        : "bg-gray-100 text-gray-600"
                  }`}
                >
                  {s.canFix === true ? "보완 가능" : s.canFix === false ? "보완 어려움" : "확인 필요"}
                </span>
              </summary>
              <div className="border-t border-gray-100 p-4 dark:border-gray-800">
                <p className="text-xs font-semibold text-gray-500">인계 → {s.action}</p>
                <p className="mt-2 text-sm leading-6 text-gray-600 dark:text-gray-400">
                  {s.detail}
                </p>
              </div>
            </details>
          ))}
        </div>
      </section>

      <div className="mt-10 rounded-xl bg-red-50 p-5 dark:bg-red-950/20">
        <p className="text-sm font-bold text-red-700 dark:text-red-400">
          ⚠️ 절대 금지
        </p>
        <div className="mt-2 space-y-1 text-xs text-red-600 dark:text-red-400">
          <p>✕ 보장 단정: &quot;실손 다 됩니다&quot; &quot;전액 받으세요&quot;</p>
          <p>✕ 승소/지급 가능성 % 표기</p>
          <p>✕ 타 병원 사례를 일반화: &quot;다른 분은 다 받았어요&quot;</p>
          <p>✕ 보험사 비방: &quot;원래 안 주려고 하는 거예요&quot;</p>
        </div>
      </div>
    </div>
  );
}
