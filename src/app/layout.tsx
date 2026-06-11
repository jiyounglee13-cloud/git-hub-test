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
  title: "카티스템 정보 - CAR-T 세포치료 안내",
  description:
    "CAR-T 세포치료(카티스템)에 대한 종합 정보를 제공합니다. 치료 원리, 과정, 부작용, FAQ 등을 확인하세요.",
};

const navLinks = [
  { href: "/", label: "홈" },
  { href: "/about", label: "CAR-T란?" },
  { href: "/process", label: "치료 과정" },
  { href: "/side-effects", label: "부작용" },
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
              🧬 카티스템
            </Link>
            <ul className="flex gap-6 text-sm font-medium">
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
              본 사이트는 교육 및 정보 제공 목적으로 제작되었습니다. 의료적
              결정은 반드시 전문의와 상담하세요.
            </p>
            <p className="mt-2">
              &copy; 2026 카티스템 정보. All rights reserved.
            </p>
          </div>
        </footer>
      </body>
    </html>
  );
}
