import Link from "next/link";

const features = [
  {
    icon: "🔬",
    title: "CAR-T 세포치료란?",
    description:
      "환자 자신의 면역세포(T세포)를 유전자 변형하여 암세포를 공격하도록 설계하는 혁신적인 면역항암 치료법입니다.",
    href: "/about",
  },
  {
    icon: "🏥",
    title: "치료 과정",
    description:
      "T세포 채집부터 유전자 변형, 배양, 주입까지 카티스템 치료의 전체 과정을 단계별로 안내합니다.",
    href: "/process",
  },
  {
    icon: "⚠️",
    title: "부작용 관리",
    description:
      "사이토카인 방출 증후군(CRS), 신경독성 등 주요 부작용과 관리 방법에 대해 알아봅니다.",
    href: "/side-effects",
  },
  {
    icon: "❓",
    title: "자주 묻는 질문",
    description:
      "카티스템 치료 대상, 비용, 성공률 등 환자와 보호자가 궁금해하는 질문에 답합니다.",
    href: "/faq",
  },
];

const stats = [
  { value: "80%+", label: "완전관해율 (혈액암)" },
  { value: "2017", label: "미국 FDA 최초 승인" },
  { value: "6종+", label: "글로벌 승인 제품" },
  { value: "30+", label: "적응증 임상 진행 중" },
];

export default function Home() {
  return (
    <div>
      <section className="bg-gradient-to-br from-blue-600 to-indigo-800 px-6 py-24 text-white dark:from-blue-900 dark:to-indigo-950">
        <div className="mx-auto max-w-4xl text-center">
          <h1 className="text-4xl font-bold leading-tight tracking-tight sm:text-5xl">
            카티스템
            <br />
            <span className="text-blue-200">CAR-T 세포치료 종합 안내</span>
          </h1>
          <p className="mt-6 text-lg leading-8 text-blue-100">
            키메라 항원 수용체 T세포(CAR-T) 치료는 환자의 면역세포를 재프로그래밍하여
            암을 치료하는 차세대 면역항암 요법입니다. 카티스템에 대한 정확한 정보를
            제공합니다.
          </p>
          <div className="mt-8 flex justify-center gap-4">
            <Link
              href="/about"
              className="rounded-full bg-white px-6 py-3 text-sm font-semibold text-blue-700 shadow transition hover:bg-blue-50"
            >
              자세히 알아보기
            </Link>
            <Link
              href="/faq"
              className="rounded-full border border-white/30 px-6 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
            >
              자주 묻는 질문
            </Link>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-16">
        <div className="grid grid-cols-2 gap-8 sm:grid-cols-4">
          {stats.map((stat) => (
            <div key={stat.label} className="text-center">
              <p className="text-3xl font-bold text-[var(--primary)]">
                {stat.value}
              </p>
              <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                {stat.label}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 pb-20">
        <h2 className="mb-10 text-center text-2xl font-bold">
          카티스템 알아보기
        </h2>
        <div className="grid gap-8 sm:grid-cols-2">
          {features.map((feature) => (
            <Link
              key={feature.title}
              href={feature.href}
              className="group rounded-2xl border border-gray-200 p-8 transition-all hover:border-[var(--primary-light)] hover:shadow-lg dark:border-gray-800 dark:hover:border-[var(--primary)]"
            >
              <span className="text-3xl">{feature.icon}</span>
              <h3 className="mt-4 text-lg font-semibold group-hover:text-[var(--primary)]">
                {feature.title}
              </h3>
              <p className="mt-2 text-sm leading-6 text-gray-600 dark:text-gray-400">
                {feature.description}
              </p>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
