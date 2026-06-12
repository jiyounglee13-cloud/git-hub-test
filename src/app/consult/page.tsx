"use client";

import { useState } from "react";
import {
  consultCards,
  CONSULT_TOPICS,
  type ConsultCard,
} from "@/lib/consult-data";

function CardView({ card }: { card: ConsultCard }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="rounded-xl border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900">
      <button
        onClick={() => setOpen(!open)}
        className="flex w-full items-start gap-3 p-5 text-left"
      >
        <span className="mt-0.5 shrink-0 font-mono text-xs font-bold text-gray-400">
          {card.id}
        </span>
        <div className="flex-1">
          <span className="mb-1 inline-block rounded-full bg-blue-50 px-2 py-0.5 text-[10px] font-bold text-blue-700 dark:bg-blue-900/30 dark:text-blue-300">
            {card.topic}
          </span>
          <p className="text-[15px] font-semibold leading-snug">{card.question}</p>
        </div>
        <span className="shrink-0 text-gray-400">{open ? "−" : "+"}</span>
      </button>

      {open && (
        <div className="border-t border-gray-100 px-5 pb-5 pt-4 dark:border-gray-800">
          <div className="rounded-xl bg-green-50 p-4 dark:bg-green-950/20">
            <p className="mb-1 text-[10px] font-bold text-green-700">✓ 권장 응대</p>
            <p className="text-sm leading-7 text-green-900 dark:text-green-200">
              {card.script}
            </p>
          </div>

          {card.followUp.length > 0 && (
            <div className="mt-4 space-y-2">
              <p className="text-[10px] font-bold text-gray-500">후속 질문</p>
              {card.followUp.map((f) => (
                <div
                  key={f.q}
                  className="rounded-lg bg-gray-50 p-3 dark:bg-gray-800"
                >
                  <p className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                    Q. {f.q}
                  </p>
                  <p className="mt-1 text-xs leading-5 text-gray-500 dark:text-gray-400">
                    {f.a}
                  </p>
                </div>
              ))}
            </div>
          )}

          {card.no.length > 0 && (
            <div className="mt-4 rounded-lg bg-red-50 p-3 dark:bg-red-950/20">
              <p className="mb-1 text-[10px] font-bold text-red-600">✕ 금지 표현</p>
              {card.no.map((n) => (
                <p key={n} className="text-xs text-red-700 dark:text-red-400">
                  • {n}
                </p>
              ))}
            </div>
          )}

          {card.esc.length > 0 && (
            <div className="mt-3 rounded-lg bg-purple-50 p-3 dark:bg-purple-950/20">
              <p className="mb-1 text-[10px] font-bold text-purple-600">↗ 에스컬레이션</p>
              {card.esc.map((e) => (
                <p key={e.trigger} className="text-xs text-purple-700 dark:text-purple-400">
                  {e.trigger} → {e.action}
                </p>
              ))}
            </div>
          )}

          {card.notes && (
            <div className="mt-3 rounded-lg bg-amber-50 p-3 dark:bg-amber-950/20">
              <p className="mb-1 text-[10px] font-bold text-amber-600">📝 참고</p>
              <p className="text-xs text-amber-700 dark:text-amber-400">
                {card.notes}
              </p>
            </div>
          )}

          {card.deepDive && (
            <details className="mt-3">
              <summary className="cursor-pointer text-xs font-bold text-gray-400 hover:text-gray-600">
                🔍 심화 정보 보기
              </summary>
              <p className="mt-2 rounded-lg bg-gray-50 p-3 text-xs leading-5 text-gray-500 dark:bg-gray-800">
                {card.deepDive}
              </p>
            </details>
          )}
        </div>
      )}
    </div>
  );
}

export default function ConsultPage() {
  const [search, setSearch] = useState("");
  const [activeTopic, setActiveTopic] = useState<string | null>(null);

  const filtered = consultCards.filter((card) => {
    const matchTopic = !activeTopic || card.topic === activeTopic;
    const matchSearch =
      !search ||
      card.question.includes(search) ||
      card.keywords.some((k) => k.includes(search)) ||
      card.script.includes(search);
    return matchTopic && matchSearch;
  });

  return (
    <div className="mx-auto max-w-3xl px-6 py-10">
      <h1 className="text-2xl font-bold">🩺 상담 가이드</h1>
      <p className="mt-2 text-sm text-gray-500">
        환자 질문·키워드로 검색하여 권장 응대, 금지 표현, 에스컬레이션 규칙을
        확인합니다.
      </p>

      <div className="mt-6">
        <input
          type="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="환자 질문·키워드 검색 (예: 실비, 성공률, 인공관절…)"
          className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm shadow-sm outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-100 dark:border-gray-700 dark:bg-gray-900"
        />
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        <button
          onClick={() => setActiveTopic(null)}
          className={`rounded-full border px-3 py-1.5 text-xs font-medium transition ${
            !activeTopic
              ? "border-gray-800 bg-gray-800 text-white"
              : "border-gray-200 text-gray-500 hover:border-gray-400 dark:border-gray-700"
          }`}
        >
          전체
        </button>
        {CONSULT_TOPICS.map((topic) => (
          <button
            key={topic}
            onClick={() => setActiveTopic(topic === activeTopic ? null : topic)}
            className={`rounded-full border px-3 py-1.5 text-xs font-medium transition ${
              activeTopic === topic
                ? "border-blue-500 bg-blue-500 text-white"
                : "border-gray-200 text-gray-500 hover:border-blue-300 dark:border-gray-700"
            }`}
          >
            {topic}
          </button>
        ))}
      </div>

      <p className="mt-4 text-xs text-gray-400">{filtered.length}개 카드</p>

      <div className="mt-4 space-y-3">
        {filtered.map((card) => (
          <CardView key={card.id} card={card} />
        ))}
        {filtered.length === 0 && (
          <p className="py-12 text-center text-sm text-gray-400">
            검색 결과가 없습니다.
          </p>
        )}
      </div>
    </div>
  );
}
