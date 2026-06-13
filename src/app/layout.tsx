import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Link from "next/link";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "카티스템 상담 도구 - CARTSTEM Consultation Suite",
  description:
    "카티스템(CARTSTEM) 상담 전 페르소나 브리핑, 상담 가이드, 실손보험 안내, 급여 청구 가이드를 제공하는 통합 상담 도구입니다.",
};

const navLinks = [
  { href: "/", label: "홈" },
  { href: "/persona", label: "페르소나 브리핑" },
  { href: "/consult", label: "상담 가이드" },
  { href: "/insurance", label: "실손보험" },
  { href: "/billing", label: "급여 청구" },
  { href: "/xray", label: "무릎 X-ray (데모)" },
  { href: "/faq", label: "FAQ" },
];

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="ko"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <header className="sticky top-0 z-50 border-b border-gray-200 bg-white/80 backdrop-blur-md dark:border-gray-800 dark:bg-gray-950/80">
          <nav className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
            <Link
              href="/"
              className="text-xl font-bold text-[var(--primary)]"
            >
              🦴 카티스템
            </Link>
            <ul className="flex gap-4 text-sm font-medium">
              {navLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-gray-600 transition-colors hover:text-[var(--primary)] dark:text-gray-400 dark:hover:text-[var(--primary-light)]"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </header>

        <main className="flex-1">{children}</main>

        <footer className="border-t border-gray-200 bg-gray-50 dark:border-gray-800 dark:bg-gray-950">
          <div className="mx-auto max-w-6xl px-6 py-8 text-center text-sm text-gray-500 dark:text-gray-400">
            <p>
              본 도구는 상담 준비를 위한 내부 참고용입니다. 카티스템은
              전문의약품으로 치료 적합성은 담당 의사가 판단합니다.
            </p>
            <p className="mt-1">
              개별 환자의 경과와 보험 보장 여부는 다를 수 있습니다.
            </p>
            <p className="mt-2">
              &copy; 2026 카티스템 상담 도구. 본 도구는 어떤 정보도 저장하지
              않습니다.
            </p>
          </div>
        </footer>
      </body>
    </html>
  );
}
