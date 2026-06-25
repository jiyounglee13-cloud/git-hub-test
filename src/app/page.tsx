import Link from "next/link";

const tools = [
  {
    icon: "🎯",
    title: "페르소나 브리핑",
    description:
      "환자 기본 정보를 입력하면 손상 서사(A축)와 의사결정 동인(B축) 2축으로 매칭하여 맞춤형 상담 브리핑 카드를 생성합니다.",
    href: "/persona",
    color: "from-indigo-500 to-purple-600",
    badge: "v1.1",
  },
  {
    icon: "🩺",
    title: "상담 가이드",
    description:
      "제품 정보, 시술 과정, 줄기세포, 경쟁품 비교, 재활 등 상담원이 알아야 할 Q&A 카드를 검색하고 참조합니다.",
    href: "/consult",
    color: "from-blue-500 to-cyan-600",
    badge: "22+ 카드",
  },
  {
    icon: "🛡️",
    title: "실손보험 안내",
    description:
      "실손 세대별 보장 구조, 청구 서류, 거절 사유 6슬롯 대응 체계를 안내합니다. 보장 단정·승소 가능성 % 표기 절대 금지.",
    href: "/insurance",
    color: "from-amber-500 to-orange-600",
    badge: "6슬롯",
  },
  {
    icon: "📋",
    title: "급여 청구 가이드",
    description:
      "카티스템 동반 급여 수술 9개 분류, OCD 케이스, 의무기록 작성 가이드, 부당청구 위험 패턴을 의료진에게 안내합니다.",
    href: "/billing",
    color: "from-teal-500 to-emerald-600",
    badge: "의료진용",
  },
  {
    icon: "❓",
    title: "환자 FAQ",
    description:
      "카티스템 치료 대상, 비용, 효과, 재활 등 환자와 보호자가 자주 묻는 질문에 대한 답변을 확인합니다.",
    href: "/faq",
    color: "from-rose-500 to-pink-600",
    badge: "8개 FAQ",
  },
  {
    icon: "🗂️",
    title: "지급거절 대응 카드",
    description:
      "질환·시술, 실손 세대, 거절 사유를 선택하면 정당성 판정 → 반박 요지 → 의료자문 대응 → 증빙 → 이의신청 초안 골격을 묶은 표준 대응 카드를 생성합니다. 정당 거절은 솔직히 안내합니다.",
    href: "/casebook",
    color: "from-violet-500 to-fuchsia-600",
    badge: "사례집",
  },
];

const goldenRules = [
  {
    num: "01",
    rule: "의학적 판단은 의사에게",
    detail: "적응증·단계·예후를 상담원이 판정하지 않는다",
  },
  {
    num: "02",
    rule: "보험 보장을 단정하지 않는다",
    detail: '"실손 다 됩니다"는 금지 — 약관별 상이',
  },
  {
    num: "03",
    rule: "효과를 보장하지 않는다",
    detail: '"완치·100%·평생" 금지 — 개인차 있음',
  },
  {
    num: "04",
    rule: "경쟁 치료를 폄하하지 않는다",
    detail: "사실 차이만 안내, 우열 단정 금지",
  },
  {
    num: "05",
    rule: "공포를 조장하지 않는다",
    detail: '"지금 안 하면 큰일" 금지 — 시급성은 의사 판단',
  },
];

export default function Home() {
  return (
    <div>
      <section className="bg-gradient-to-br from-slate-800 to-slate-950 px-6 py-20 text-white">
        <div className="mx-auto max-w-4xl text-center">
          <p className="mb-3 text-sm font-semibold tracking-widest text-teal-400">
            CARTSTEM CONSULTATION SUITE
          </p>
          <h1 className="text-4xl font-bold leading-tight tracking-tight sm:text-5xl">
            카티스템 상담 도구
          </h1>
          <p className="mt-4 text-lg leading-8 text-slate-300">
            페르소나 브리핑 · 상담 가이드 · 실손보험 · 급여 청구
          </p>
          <p className="mt-2 text-sm text-slate-400">
            메디포스트 · 동종 제대혈 유래 줄기세포 치료제 · 품목허가번호
            201200401
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-12">
        <div className="mb-10 rounded-2xl bg-gradient-to-r from-slate-800 to-slate-900 p-6 text-white shadow-lg">
          <h2 className="mb-1 text-sm font-bold tracking-widest text-amber-400">
            ⚡ 황금 규칙 5계명
          </h2>
          <p className="mb-4 text-xs text-slate-400">
            모든 상담에 공통 적용 — 위반 시 법적·윤리적 리스크
          </p>
          <div className="grid gap-3 sm:grid-cols-5">
            {goldenRules.map((r) => (
              <div
                key={r.num}
                className="rounded-xl bg-white/[0.06] p-4 text-center"
              >
                <span className="font-mono text-xs font-bold text-teal-400">
                  {r.num}
                </span>
                <p className="mt-1 text-sm font-semibold">{r.rule}</p>
                <p className="mt-1 text-xs text-slate-400">{r.detail}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {tools.map((tool) => (
            <Link
              key={tool.title}
              href={tool.href}
              className="group relative overflow-hidden rounded-2xl border border-gray-200 bg-white p-8 shadow-sm transition-all hover:border-transparent hover:shadow-xl dark:border-gray-800 dark:bg-gray-900"
            >
              <div
                className={`absolute inset-x-0 top-0 h-1 bg-gradient-to-r ${tool.color} opacity-0 transition-opacity group-hover:opacity-100`}
              />
              <div className="flex items-center gap-3">
                <span className="text-3xl">{tool.icon}</span>
                <span className="rounded-full bg-gray-100 px-2.5 py-0.5 text-[10px] font-bold text-gray-500 dark:bg-gray-800">
                  {tool.badge}
                </span>
              </div>
              <h3 className="mt-4 text-lg font-bold">{tool.title}</h3>
              <p className="mt-2 text-sm leading-6 text-gray-500 dark:text-gray-400">
                {tool.description}
              </p>
            </Link>
          ))}
        </div>
      </section>

      <section className="border-t border-gray-100 bg-gray-50 px-6 py-10 dark:border-gray-800 dark:bg-gray-950">
        <div className="mx-auto max-w-3xl text-center text-xs leading-6 text-gray-400">
          <p>※ 본 자료는 상담 준비를 위한 내부 참고용입니다.</p>
          <p>※ 카티스템은 전문의약품으로 치료 적합성은 담당 의사가 판단합니다.</p>
          <p>※ 개별 환자의 경과와 보험 보장 여부는 다를 수 있습니다.</p>
          <p className="mt-2 font-semibold text-gray-500">
            본 도구는 어떤 정보도 저장하지 않습니다.
          </p>
        </div>
      </section>
    </div>
  );
}
