import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
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
  title: "Knee OA & HTO Assistant (데모)",
  description:
    "무릎 X-ray의 K&L 등급을 추정하고 HTO 교정각·정렬(HKA/MPTA/JLCA/mLDFA)을 계산하는 독립형 연구·교육용 데모.",
};

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
        <header className="border-b border-gray-200 bg-white/80 backdrop-blur-md dark:border-gray-800 dark:bg-gray-950/80">
          <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
            <span className="text-lg font-bold text-[var(--primary)]">
              🦵 Knee OA &amp; HTO Assistant
            </span>
            <span className="text-xs font-medium text-gray-400">
              독립형 데모 · 연구·교육용
            </span>
          </div>
        </header>

        <main className="flex-1">{children}</main>

        <footer className="border-t border-gray-200 bg-gray-50 dark:border-gray-800 dark:bg-gray-950">
          <div className="mx-auto max-w-6xl px-6 py-6 text-center text-xs text-gray-500 dark:text-gray-400">
            <p>
              본 도구는 연구·교육용 데모이며 진단·치료 목적으로 사용할 수
              없습니다. 어떤 영상도 서버에 저장하지 않습니다.
            </p>
          </div>
        </footer>
      </body>
    </html>
  );
}
