import Link from "next/link";

const features = [
  {
    icon: "🔬",
    title: "카티스템이란?",
    description:
      "동종 제대혈 유래 중간엽줄기세포(MSC)를 이용하여 손상된 무릎 연골을 재생하는 세계 최초의 동종 줄기세포 치료제입니다.",
    href: "/about",
  },
  {
    icon: "🏥",
    title: "치료 과정",
    description:
      "진단부터 관절경 수술을 통한 줄기세포 투여, 재활까지 카티스템 치료의 전체 과정을 단계별로 안내합니다.",
    href: "/process",
  },
  {
    icon: "⚠️",
    title: "부작용 관리",
    description:
      "수술 부위 통증, 부종, 감염 위험 등 주요 부작용과 관리 방법에 대해 알아봅니다.",
    href: "/side-effects",
  },
  {
    icon: "❓",
    title: "자주 묻는 질문",
    description:
      "카티스템 치료 대상, 비용, 효과 지속 기간 등 환자분들이 궁금해하는 질문에 답합니다.",
    href: "/faq",
  },
];

const stats = [
  { value: "2012", label: "세계 최초 허가 (한국 식약처)" },
  { value: "1회", label: "단일 투여로 치료" },
  { value: "15,000+", label: "누적 투여 환자 수" },
  { value: "메디포스트", label: "개발사" },
];

export default function Home() {
  return (
    <div>
      <section className="bg-gradient-to-br from-teal-600 to-emerald-800 px-6 py-24 text-white dark:from-teal-900 dark:to-emerald-950">
        <div className="mx-auto max-w-4xl text-center">
          <h1 className="text-4xl font-bold leading-tight tracking-tight sm:text-5xl">
            카티스템
            <br />
            <span className="text-teal-200">CARTSTEM 연골재생 줄기세포 치료제</span>
          </h1>
          <p className="mt-6 text-lg leading-8 text-teal-100">
            카티스템(CARTSTEM)은 동종 제대혈 유래 중간엽줄기세포를 이용한 세계
            최초의 동종 줄기세포 연골재생 치료제입니다. 퇴행성 또는 반복적
            외상으로 인한 무릎 연골 결손 환자에게 새로운 치료 옵션을 제공합니다.
          </p>
          <div className="mt-8 flex justify-center gap-4">
            <Link
              href="/about"
              className="rounded-full bg-white px-6 py-3 text-sm font-semibold text-teal-700 shadow transition hover:bg-teal-50"
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
