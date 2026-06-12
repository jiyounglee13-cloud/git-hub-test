"use client";

import { useState } from "react";
import {
  FORM_FIELDS,
  generateBriefing,
  FORBIDDEN_WORDS,
  type ConsultationFormInput,
  type BriefingData,
} from "@/lib/persona-data";

function FormStep({
  field,
  value,
  onChange,
}: {
  field: (typeof FORM_FIELDS)[number];
  value: string | string[];
  onChange: (val: string | string[]) => void;
}) {
  if (field.type === "multiselect") {
    const selected = (value as string[]) || [];
    return (
      <div>
        <h3 className="mb-1 text-sm font-bold text-gray-800 dark:text-gray-200">
          {field.label}
        </h3>
        <div className="flex flex-wrap gap-2">
          {field.options.map((opt) => {
            const active = selected.includes(opt.value);
            return (
              <button
                key={opt.value}
                type="button"
                onClick={() => {
                  if (active) {
                    onChange(selected.filter((v) => v !== opt.value));
                  } else if (!field.maxSelect || selected.length < field.maxSelect) {
                    onChange([...selected, opt.value]);
                  }
                }}
                className={`rounded-full border px-4 py-2 text-sm font-medium transition-all ${
                  active
                    ? "border-indigo-500 bg-indigo-500 text-white"
                    : "border-gray-200 bg-white text-gray-600 hover:border-indigo-300 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300"
                }`}
              >
                {opt.label}
              </button>
            );
          })}
        </div>
        {field.maxSelect && (
          <p className="mt-1 text-xs text-gray-400">
            최대 {field.maxSelect}개 선택 ({selected.length}/{field.maxSelect})
          </p>
        )}
      </div>
    );
  }

  return (
    <div>
      <h3 className="mb-1 text-sm font-bold text-gray-800 dark:text-gray-200">
        {field.label}
      </h3>
      <div className="flex flex-wrap gap-2">
        {field.options.map((opt) => (
          <button
            key={opt.value}
            type="button"
            onClick={() => onChange(opt.value)}
            className={`rounded-full border px-4 py-2 text-sm font-medium transition-all ${
              value === opt.value
                ? "border-indigo-500 bg-indigo-500 text-white"
                : "border-gray-200 bg-white text-gray-600 hover:border-indigo-300 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300"
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>
    </div>
  );
}

function BriefingCard({ data }: { data: BriefingData }) {
  return (
    <div className="space-y-6">
      <div className="rounded-2xl border-2 border-indigo-200 bg-gradient-to-br from-indigo-50 to-purple-50 p-6 dark:border-indigo-800 dark:from-indigo-950/30 dark:to-purple-950/30">
        <div className="flex flex-wrap items-center gap-3">
          <span className="rounded-full bg-indigo-100 px-3 py-1 text-sm font-bold text-indigo-700 dark:bg-indigo-900 dark:text-indigo-300">
            {data.aPersona.emoji} {data.aPersona.name}
          </span>
          <span className="text-gray-400">×</span>
          <span className="rounded-full bg-amber-100 px-3 py-1 text-sm font-bold text-amber-700 dark:bg-amber-900 dark:text-amber-300">
            {data.bPersona.emoji} {data.bPersona.name}
          </span>
        </div>
        <p className="mt-2 text-sm font-semibold text-gray-700 dark:text-gray-300">
          {data.label}
        </p>
        {data.blendNotes.length > 0 && (
          <div className="mt-2 space-y-1">
            {data.blendNotes.map((note, i) => (
              <p key={i} className="text-xs text-gray-500">
                🔄 {note}
              </p>
            ))}
          </div>
        )}
      </div>

      <div className="rounded-xl border border-gray-200 p-5 dark:border-gray-800">
        <h3 className="mb-2 text-sm font-bold text-indigo-600">▌ 환자의 이야기 (A축)</h3>
        <p className="text-sm leading-7 text-gray-700 dark:text-gray-300">
          {data.aPersona.summary}
        </p>
        <p className="mt-2 text-xs text-gray-500">{data.aPersona.psychology}</p>
      </div>

      <div className="rounded-xl border border-gray-200 p-5 dark:border-gray-800">
        <h3 className="mb-2 text-sm font-bold text-amber-600">▌ 의사결정의 열쇠 (B축)</h3>
        <p className="text-sm leading-7 text-gray-700 dark:text-gray-300">
          {data.bPersona.summary}
        </p>
        <p className="mt-2 text-xs text-gray-500">{data.bPersona.psychology}</p>
      </div>

      <div className="rounded-xl border border-gray-200 p-5 dark:border-gray-800">
        <h3 className="mb-3 text-sm font-bold text-blue-600">
          ▌ 이 환자가 물어볼 가능성 높은 질문
        </h3>
        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <p className="mb-2 text-xs font-bold text-indigo-500">A축 특화</p>
            {data.aPersona.signatureQuestions.map((q) => (
              <p key={q} className="mb-1 text-sm text-gray-600 dark:text-gray-400">
                • {q}
              </p>
            ))}
          </div>
          <div>
            <p className="mb-2 text-xs font-bold text-amber-500">B축 특화</p>
            {data.bPersona.signatureQuestions.map((q) => (
              <p key={q} className="mb-1 text-sm text-gray-600 dark:text-gray-400">
                • {q}
              </p>
            ))}
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-gray-200 p-5 dark:border-gray-800">
        <h3 className="mb-2 text-sm font-bold text-teal-600">▌ 상담 전략</h3>
        <div className="space-y-2 text-sm leading-7 text-gray-700 dark:text-gray-300">
          {data.combinedStrategy.map((s, i) => (
            <p key={i}>• {s}</p>
          ))}
        </div>
      </div>

      <div className="rounded-xl border border-red-200 bg-red-50 p-5 dark:border-red-900 dark:bg-red-950/20">
        <h3 className="mb-2 text-sm font-bold text-red-600">
          ⚠️ 컴플라이언스 주의
        </h3>
        <div className="space-y-1">
          {data.combinedComplianceFlags.map((flag, i) => (
            <p key={i} className="text-sm text-red-700 dark:text-red-400">
              ✕ {flag}
            </p>
          ))}
        </div>
      </div>

      {data.mismatchWarnings.length > 0 && (
        <div className="rounded-xl border border-gray-200 bg-gray-50 p-5 dark:border-gray-800 dark:bg-gray-900">
          <h3 className="mb-2 text-sm font-bold text-gray-600">
            🔄 불일치 신호 &amp; 전환 힌트
          </h3>
          <div className="space-y-1 text-sm text-gray-500">
            {data.mismatchWarnings.map((s, i) => (
              <p key={i}>• {s}</p>
            ))}
          </div>
        </div>
      )}

      <div className="rounded-xl border border-gray-300 bg-white p-5 dark:border-gray-700 dark:bg-gray-900">
        <h3 className="mb-2 text-sm font-bold text-gray-600">
          📋 [본원 확인] 필요 항목
        </h3>
        <div className="grid gap-2 sm:grid-cols-2">
          {[
            "비급여 가격표 (약가 + 부대비용)",
            "입원 기간 및 재활 프로토콜",
            "마취 방식 (전신/척추/수면)",
            "실손보험 서류 발급 절차",
          ].map((item) => (
            <div
              key={item}
              className="flex items-center gap-2 rounded-lg border border-dashed border-gray-300 p-3 text-sm text-gray-500 dark:border-gray-700"
            >
              <span className="h-4 w-4 rounded border border-gray-300" />
              {item}
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-xl bg-gray-100 p-4 text-center text-xs leading-5 text-gray-500 dark:bg-gray-900">
        <p>
          페르소나는 상담 준비 참고 도구입니다. 실제 관심사는 대화 속에서
          확인하고, 불일치 신호가 보이면 즉시 전환하세요.
        </p>
      </div>
    </div>
  );
}

export default function PersonaPage() {
  const [formData, setFormData] = useState<Record<string, string | string[]>>({});
  const [briefing, setBriefing] = useState<BriefingData | null>(null);
  const [showResult, setShowResult] = useState(false);

  const handleSubmit = () => {
    const input = {
      연령대: formData["연령대"] as string || "50대",
      성별: formData["성별"] as string || "미응답",
      손상경위: formData["손상경위"] as string || "특별한 계기 없이 서서히",
      통증기간: formData["통증기간"] as string || "6개월~2년",
      활동이력: formData["활동이력"] as string || "일상활동수준",
      치료목표: (formData["치료목표"] as string[]) || [],
      실손보험: formData["실손보험"] as string || "없음모름",
      의사결정단계: formData["의사결정단계"] as string || "첫탐색",
      동반자: formData["동반자"] as string || "본인단독",
      사전정보수준: formData["사전정보수준"] as string || "거의모름",
      주요우려: (formData["주요우려"] as string[]) || [],
    } as ConsultationFormInput;

    const result = generateBriefing(input);
    setBriefing(result);
    setShowResult(true);
  };

  const handleReset = () => {
    setFormData({});
    setBriefing(null);
    setShowResult(false);
  };

  if (showResult && briefing) {
    return (
      <div className="mx-auto max-w-3xl px-6 py-10">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-2xl font-bold">🎯 페르소나 브리핑 카드</h1>
          <button
            onClick={handleReset}
            className="rounded-full bg-gray-100 px-4 py-2 text-sm font-medium text-gray-600 transition hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300"
          >
            새 상담 시작
          </button>
        </div>
        <BriefingCard data={briefing} />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-6 py-10">
      <h1 className="text-2xl font-bold">🎯 페르소나 브리핑 도구</h1>
      <p className="mt-2 text-sm text-gray-500">
        환자 기본 정보를 선택하면 2축 복합 매칭으로 맞춤형 상담 브리핑을
        생성합니다. 60초 입력 목표, 자유 텍스트 없음.
      </p>

      <div className="mt-8 space-y-6">
        {FORM_FIELDS.map((field) => (
          <FormStep
            key={field.key}
            field={field}
            value={formData[field.key] || (field.type === "multiselect" ? [] : "")}
            onChange={(val) =>
              setFormData((prev) => ({ ...prev, [field.key]: val }))
            }
          />
        ))}
      </div>

      <div className="mt-10 flex gap-4">
        <button
          onClick={handleSubmit}
          className="flex-1 rounded-full bg-indigo-600 py-3 text-sm font-bold text-white shadow transition hover:bg-indigo-700"
        >
          브리핑 카드 생성
        </button>
        <button
          onClick={handleReset}
          className="rounded-full border border-gray-200 px-6 py-3 text-sm font-medium text-gray-500 transition hover:bg-gray-50 dark:border-gray-700"
        >
          초기화
        </button>
      </div>
    </div>
  );
}
