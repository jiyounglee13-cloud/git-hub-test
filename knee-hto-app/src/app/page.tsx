import type { Metadata } from "next";
import KneeTool from "./KneeTool";

export const metadata: Metadata = {
  title: "무릎 OA & HTO 보조 도구 (데모) — Knee OA & HTO Assistant",
  description:
    "무릎 X-ray의 K&L 등급을 LLM 비전으로 추정하고, HTO 교정각·개대 쐐기 높이를 기하 계산하여 Before/After를 시뮬레이션하는 연구·교육용 데모입니다.",
};

export default function XrayPage() {
  return (
    <div className="mx-auto max-w-6xl px-6 py-10">
      {/* 안전 배너 */}
      <div className="mb-6 rounded-xl border-2 border-amber-400 bg-amber-50 px-4 py-3 text-sm text-amber-800 dark:border-amber-600 dark:bg-amber-950/40 dark:text-amber-200">
        <b>⚠ 연구·교육용 데모 / 진단·치료 목적 사용 불가.</b> K&L 등급은 LLM
        비전의 <b>추정</b>이며 재현성이 보장되지 않습니다. 교정각은 사용자가 찍은
        랜드마크 기반 <b>기하 계산</b>이고, Before/After는 <b>시뮬레이션</b>입니다.
        연골 상태는 X-ray로 직접 평가할 수 없습니다(MRI/관절경 필요).
      </div>

      <header className="mb-8">
        <h1 className="text-2xl font-bold sm:text-3xl">
          🦵 무릎 OA &amp; HTO 보조 도구{" "}
          <span className="align-middle text-sm font-medium text-gray-400">
            데모
          </span>
        </h1>
        <p className="mt-2 max-w-3xl text-sm text-gray-600 dark:text-gray-400">
          이미지 업로드 → K&amp;L 0~4 등급 추정 → 랜드마크 보정 → HTO 교정각·개대
          쐐기 계산 → Before/After 시뮬레이션 + 연골 상태별 시나리오. 판독(정성)은
          LLM, 수치(각도/거리)는 결정론적 기하 계산으로 분리되어 있습니다.
        </p>
      </header>

      <KneeTool />
    </div>
  );
}
