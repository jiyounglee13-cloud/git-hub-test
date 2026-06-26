"use client";

import { useMemo, useState } from "react";
import {
  procedures,
  generations,
  denialReasons,
  buildCard,
  denialStats,
  resolutionStats,
  claimantAgeStats,
  litigationFeeCap,
  checkGuideline,
  COMPLIANCE_NOTICE,
  type AdvisoryStage,
  type DenialStatus,
} from "@/lib/casebook-data";

const won = (n: number) => n.toLocaleString("ko-KR");

const verdictStyle: Record<string, string> = {
  "정당 면책": "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300",
  다툼가능: "bg-green-100 text-green-700 dark:bg-green-950/40 dark:text-green-300",
  사기위험: "bg-red-100 text-red-700 dark:bg-red-950/40 dark:text-red-300",
};

export default function CasebookPage() {
  const [procId, setProcId] = useState("");
  const [genId, setGenId] = useState("");
  const [selReasons, setSelReasons] = useState<string[]>([]);
  const [stage, setStage] = useState<AdvisoryStage>("동의 후");
  const [status, setStatus] = useState<DenialStatus>("부지급");
  const [submitted, setSubmitted] = useState(false);
  const [claimAmount, setClaimAmount] = useState(30_000_000);
  const [annualCount, setAnnualCount] = useState(0);
  const [perSiteCount, setPerSiteCount] = useState(0);

  const feeCap = litigationFeeCap(Math.max(0, claimAmount));

  const proc = procedures.find((p) => p.id === procId);
  const availableReasons = useMemo(
    () => (proc ? denialReasons.filter((r) => proc.reasonIds.includes(r.id)) : []),
    [proc]
  );
  const advisorySelected = selReasons.some(
    (id) => denialReasons.find((r) => r.id === id)?.involvesAdvisory
  );

  const card =
    submitted && procId && genId && selReasons.length > 0
      ? buildCard({
          procedureId: procId,
          generationId: genId,
          reasonIds: selReasons,
          advisoryStage: stage,
          denialStatus: status,
        })
      : null;

  function toggleReason(id: string) {
    setSubmitted(false);
    setSelReasons((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  }

  const canSubmit = procId && genId && selReasons.length > 0;

  return (
    <div className="mx-auto max-w-4xl px-6 py-10">
      <h1 className="text-2xl font-bold">🗂️ 지급거절 대응 카드</h1>
      <p className="mt-2 text-sm text-gray-500">
        질환·시술, 실손 세대, 거절 사유를 선택하면 표준 대응 카드와 이의신청 초안
        골격을 생성합니다.
      </p>

      <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-4 dark:border-amber-900 dark:bg-amber-950/20">
        <p className="text-xs leading-5 text-amber-700 dark:text-amber-400">
          이 도구는 정보 제공용이며 변호사·손해사정사의 대리·자문이 아닙니다. 정당한
          거절은 솔직히 안내하고, 다툼 여지가 있는 건만 근거를 갖추도록 돕습니다.
          무료 채널(보험사 재심사 → 금융감독원 분쟁조정)을 우선 안내합니다.
        </p>
      </div>

      {/* 입력 폼 */}
      <section className="mt-8 space-y-6">
        <div>
          <label className="mb-2 block text-sm font-bold">질환 · 시술</label>
          <div className="flex flex-wrap gap-2">
            {procedures.map((p) => (
              <button
                key={p.id}
                onClick={() => {
                  setProcId(p.id);
                  setSelReasons([]);
                  setSubmitted(false);
                }}
                className={`rounded-full border px-4 py-2 text-sm transition-all ${
                  procId === p.id
                    ? "border-indigo-500 bg-indigo-50 font-semibold text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-300"
                    : "border-gray-200 hover:border-gray-300 dark:border-gray-700"
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>
          {proc && (
            <p className="mt-2 text-xs text-gray-500">💡 {proc.generationNote}</p>
          )}
        </div>

        <div>
          <label className="mb-2 block text-sm font-bold">실손 세대</label>
          <div className="flex flex-wrap gap-2">
            {generations.map((g) => (
              <button
                key={g.id}
                onClick={() => {
                  setGenId(g.id);
                  setSubmitted(false);
                }}
                className={`rounded-full border px-4 py-2 text-sm transition-all ${
                  genId === g.id
                    ? "border-indigo-500 bg-indigo-50 font-semibold text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-300"
                    : "border-gray-200 hover:border-gray-300 dark:border-gray-700"
                }`}
              >
                {g.label}
                <span className="ml-1 text-[10px] text-gray-400">{g.period}</span>
              </button>
            ))}
          </div>
        </div>

        {proc && (
          <div>
            <label className="mb-2 block text-sm font-bold">
              거절 사유 <span className="font-normal text-gray-400">(복수 선택)</span>
            </label>
            <div className="space-y-2">
              {availableReasons.map((r) => (
                <label
                  key={r.id}
                  className={`flex cursor-pointer items-center gap-3 rounded-xl border p-3 transition-all ${
                    selReasons.includes(r.id)
                      ? "border-indigo-400 bg-indigo-50/60 dark:bg-indigo-950/20"
                      : "border-gray-200 hover:border-gray-300 dark:border-gray-700"
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={selReasons.includes(r.id)}
                    onChange={() => toggleReason(r.id)}
                    className="h-4 w-4 accent-indigo-600"
                  />
                  <span className="flex-1 text-sm">{r.label}</span>
                  <span className="rounded-full bg-gray-100 px-2 py-0.5 text-[10px] text-gray-500 dark:bg-gray-800">
                    {r.category}
                  </span>
                </label>
              ))}
            </div>
          </div>
        )}

        {advisorySelected && (
          <div className="grid gap-4 rounded-xl border border-blue-200 bg-blue-50/50 p-4 dark:border-blue-900 dark:bg-blue-950/20 sm:grid-cols-2">
            <div>
              <label className="mb-2 block text-xs font-bold text-blue-700 dark:text-blue-300">
                의료자문 동의 단계
              </label>
              <select
                value={stage}
                onChange={(e) => {
                  setStage(e.target.value as AdvisoryStage);
                  setSubmitted(false);
                }}
                className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-900"
              >
                <option value="동의 전">동의 전</option>
                <option value="동의 후">동의 후</option>
              </select>
            </div>
            <div>
              <label className="mb-2 block text-xs font-bold text-blue-700 dark:text-blue-300">
                현재 거절 상태
              </label>
              <select
                value={status}
                onChange={(e) => {
                  setStatus(e.target.value as DenialStatus);
                  setSubmitted(false);
                }}
                className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-900"
              >
                <option value="심사 중단">심사 중단</option>
                <option value="일부지급">일부지급</option>
                <option value="부지급">부지급</option>
              </select>
            </div>
          </div>
        )}

        {proc?.guideline && (
          <div className="rounded-xl border border-teal-200 bg-teal-50/50 p-4 dark:border-teal-900 dark:bg-teal-950/20">
            <p className="text-sm font-bold text-teal-800 dark:text-teal-300">
              📐 인정 횟수 가이드라인 충족도 ({proc.guideline.source})
            </p>
            {proc.guideline.appliesNote && (
              <p className="mt-1 text-[11px] text-teal-600 dark:text-teal-400">
                {proc.guideline.appliesNote}
              </p>
            )}
            <div className="mt-3 flex flex-wrap gap-3">
              <label className="text-xs">
                <span className="mb-1 block font-semibold text-gray-600 dark:text-gray-400">
                  연간 시행 횟수
                </span>
                <input
                  type="number"
                  min={0}
                  value={annualCount}
                  onChange={(e) => setAnnualCount(Number(e.target.value))}
                  className="w-28 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-900"
                />
              </label>
              {proc.guideline.perSiteMax !== undefined && (
                <label className="text-xs">
                  <span className="mb-1 block font-semibold text-gray-600 dark:text-gray-400">
                    부위당 최대 횟수
                  </span>
                  <input
                    type="number"
                    min={0}
                    value={perSiteCount}
                    onChange={(e) => setPerSiteCount(Number(e.target.value))}
                    className="w-28 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-900"
                  />
                </label>
              )}
            </div>
            {annualCount > 0 &&
              (() => {
                const result = checkGuideline(
                  proc.guideline!,
                  annualCount,
                  proc.guideline!.perSiteMax !== undefined ? perSiteCount : undefined
                );
                return (
                  <div
                    className={`mt-3 rounded-lg p-3 text-xs ${
                      result.status === "충족"
                        ? "bg-green-100 text-green-800 dark:bg-green-950/40 dark:text-green-300"
                        : "bg-amber-100 text-amber-800 dark:bg-amber-950/40 dark:text-amber-300"
                    }`}
                  >
                    <p className="font-bold">
                      {result.status === "충족"
                        ? "✅ 가이드라인 충족 — 인용 가능성에 유리"
                        : "⚠️ 한도 초과 — 초과분은 인과관계·치료효과 소명 필요"}
                    </p>
                    <ul className="mt-1 space-y-0.5">
                      {result.messages.map((m) => (
                        <li key={m}>· {m}</li>
                      ))}
                    </ul>
                  </div>
                );
              })()}
          </div>
        )}

        <button
          disabled={!canSubmit}
          onClick={() => setSubmitted(true)}
          className="w-full rounded-xl bg-indigo-600 py-3 text-sm font-bold text-white transition-all hover:bg-indigo-700 disabled:cursor-not-allowed disabled:bg-gray-300 dark:disabled:bg-gray-700"
        >
          대응 카드 생성
        </button>
      </section>

      {/* 카드 출력 */}
      {card && (
        <section className="mt-10 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold">{card.title}</h2>
            <span
              className={`rounded-full px-3 py-1 text-xs font-bold ${verdictStyle[card.verdict]}`}
            >
              판정: {card.verdict}
            </span>
          </div>

          <Block n="1" title="주요 거절 사유">
            <ul className="list-disc pl-5 text-sm text-gray-600 dark:text-gray-400">
              {card.denialReasons.map((r) => (
                <li key={r}>{r}</li>
              ))}
            </ul>
          </Block>

          {card.warning && (
            <div className="mt-4 rounded-xl bg-red-50 p-4 text-sm leading-6 text-red-700 dark:bg-red-950/20 dark:text-red-400">
              ⚠️ {card.warning}
            </div>
          )}

          {card.rebuttal && (
            <Block n="3" title="핵심 반박 요지 (약관·판례·조정례)">
              <KV label="쟁점" items={card.rebuttal.issues} />
              <KV label="약관 포인트" items={card.rebuttal.clausePoints} />
              <KV label="유리 근거" items={card.rebuttal.proArgs} />
              <KV label="유의(불리)" items={card.rebuttal.conArgs} muted />
            </Block>
          )}

          {card.advisory && (
            <Block n="4" title="의료자문 대응 요지">
              <ol className="list-decimal space-y-1 pl-5 text-sm text-gray-600 dark:text-gray-400">
                {card.advisory.levers.map((l) => (
                  <li key={l}>{l}</li>
                ))}
              </ol>
              <p className="mt-2 text-xs text-gray-400">※ {card.advisory.caution}</p>
            </Block>
          )}

          {card.evidence && card.evidence.length > 0 && (
            <Block n="5" title="진료의 증빙 요지 (객관적 기록 중심)">
              <div className="space-y-3">
                {card.evidence.map((e) => (
                  <div
                    key={e.issue}
                    className="rounded-lg bg-gray-50 p-3 dark:bg-gray-800/50"
                  >
                    <p className="text-xs font-bold text-gray-700 dark:text-gray-300">
                      쟁점: {e.issue}
                    </p>
                    <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                      필요 서류(증거력 순): {e.docs.join(" → ")}
                    </p>
                    <p className="mt-1 text-xs text-gray-500">확보: {e.method}</p>
                    <p className="mt-1 text-xs italic text-gray-500">
                      소견 요청 문안: “{e.script}”
                    </p>
                  </div>
                ))}
              </div>
            </Block>
          )}

          <Block n="6" title="환자 행동 단계">
            <ol className="list-decimal space-y-1 pl-5 text-sm text-gray-600 dark:text-gray-400">
              {card.actions.map((a) => (
                <li key={a}>{a}</li>
              ))}
            </ol>
          </Block>

          {card.appealDraft && (
            <Block n="7" title="이의신청 초안 골격 (빈칸 포함)">
              <pre className="whitespace-pre-wrap rounded-lg bg-gray-50 p-3 text-xs leading-6 text-gray-600 dark:bg-gray-800/50 dark:text-gray-400">
                {card.appealDraft.join("\n")}
              </pre>
            </Block>
          )}

          {card.channelNote && (
            <div className="mt-5 rounded-xl border border-teal-200 bg-teal-50 p-4 dark:border-teal-900 dark:bg-teal-950/20">
              <p className="text-xs font-bold text-teal-700 dark:text-teal-300">
                🏛️ 구제 채널 안내
              </p>
              <p className="mt-1 text-xs leading-5 text-teal-700 dark:text-teal-400">
                {card.channelNote}
              </p>
            </div>
          )}

          <Block n="8" title={card.verdict === "정당 면책" ? "정당 거절 수용 안내" : "마음 정리"}>
            <p className="whitespace-pre-wrap text-sm leading-6 text-gray-600 dark:text-gray-400">
              {card.closing}
            </p>
          </Block>

          <div className="mt-6 rounded-xl bg-gray-50 p-4 dark:bg-gray-800/50">
            <p className="text-xs leading-5 text-gray-500">📌 {card.disclaimer}</p>
          </div>
        </section>
      )}

      {/* ① 거절 사유 통계 + 구제 단계별 인용률 */}
      <section className="mt-12">
        <h2 className="text-lg font-bold">📊 거절·구제 통계</h2>
        <p className="mt-1 text-xs text-gray-500">
          한국소비자원(2021.1~2024.9, n=1,016) · 금융감독원·국정감사 자료. 단정이 아닌
          현상·추이로만 참고하세요.
        </p>

        <div className="mt-4 grid gap-6 sm:grid-cols-2">
          <div className="rounded-xl border border-gray-200 p-4 dark:border-gray-800">
            <p className="mb-3 text-sm font-bold">거절 사유별 비중</p>
            <div className="space-y-2">
              {denialStats.map((d) => (
                <div key={d.label}>
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-600 dark:text-gray-400">{d.label}</span>
                    <span className="font-semibold">{d.share}%</span>
                  </div>
                  <div className="mt-1 h-2 rounded-full bg-gray-100 dark:bg-gray-800">
                    <div
                      className="h-2 rounded-full bg-amber-500"
                      style={{ width: `${d.share}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-xl border border-gray-200 p-4 dark:border-gray-800">
            <p className="mb-3 text-sm font-bold">구제 단계별 인용/승소율</p>
            <table className="w-full text-xs">
              <tbody>
                {resolutionStats.map((r) => (
                  <tr key={r.stage} className="border-b border-gray-100 last:border-0 dark:border-gray-800">
                    <td className="py-1.5 pr-2 text-gray-600 dark:text-gray-400">
                      {r.stage}
                      {r.note && (
                        <span className="block text-[10px] text-gray-400">{r.note}</span>
                      )}
                    </td>
                    <td className="py-1.5 text-right font-bold whitespace-nowrap">{r.rate}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <p className="mt-2 text-[10px] leading-4 text-gray-400">
              ※ 소비자원 합의율은 난건만 모이는 후단 사례라 낮게 보이는 통계적 착시.
              금감원 분쟁조정이 가장 기대가치 높은 채널.
            </p>
          </div>
        </div>

        <div className="mt-4 rounded-xl border border-gray-200 p-4 dark:border-gray-800">
          <p className="mb-3 text-sm font-bold">
            피해구제 신청자 연령 분포{" "}
            <span className="font-normal text-gray-400">(40~60대 74.4%)</span>
          </p>
          <div className="flex items-end gap-3">
            {claimantAgeStats.map((a) => (
              <div key={a.label} className="flex flex-1 flex-col items-center">
                <span className="text-xs font-semibold">{a.share}%</span>
                <div
                  className="mt-1 w-full rounded-t bg-indigo-400"
                  style={{ height: `${a.share * 2}px` }}
                />
                <span className="mt-1 text-[10px] text-gray-500">{a.label}</span>
              </div>
            ))}
          </div>
          <p className="mt-2 text-[10px] text-gray-400">
            중장년층이 정보 비대칭의 주 피해자. 분쟁 다발 3종의 72.0%가 의원급 발생.
          </p>
        </div>
      </section>

      {/* ② 민사소송 패소 리스크 계산 */}
      <section className="mt-10">
        <h2 className="text-lg font-bold">⚖️ 민사소송 패소 리스크 계산</h2>
        <p className="mt-1 text-xs text-gray-500">
          소송은 최후 수단입니다. 전부 패소 시 부담을 미리 가늠해 기대치를 조정하세요.
        </p>

        <div className="mt-4 rounded-xl border border-gray-200 p-5 dark:border-gray-800">
          <label className="block text-sm font-bold">청구 금액(소가)</label>
          <div className="mt-2 flex items-center gap-3">
            <input
              type="number"
              min={0}
              step={1_000_000}
              value={claimAmount}
              onChange={(e) => setClaimAmount(Number(e.target.value))}
              className="w-48 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-900"
            />
            <span className="text-sm text-gray-500">원 ({won(claimAmount)}원)</span>
          </div>

          <div className="mt-4 rounded-lg bg-red-50 p-4 dark:bg-red-950/20">
            <p className="text-xs font-semibold text-red-700 dark:text-red-400">
              전부 패소 시 상대방에게 물어줄 변호사보수 상한
            </p>
            <p className="mt-1 text-2xl font-bold text-red-700 dark:text-red-400">
              약 {won(Math.round(feeCap))}원
            </p>
            <p className="mt-1 text-[11px] text-red-600/80 dark:text-red-400/80">
              대법원 「변호사보수의 소송비용 산입에 관한 규칙」 상한 기준
            </p>
          </div>

          <ul className="mt-3 space-y-1 text-xs text-gray-500">
            <li>+ 본인 변호사 선임료(별도)</li>
            <li>+ 상대방 인지대·송달료</li>
            <li>+ 진료기록감정료 예납 약 50만~100만원</li>
            <li>+ 항소(2심)·상고(3심) 시 심급마다 누적</li>
          </ul>
          <p className="mt-3 text-[11px] leading-4 text-gray-400">
            ※ 일부 승소 시 법원 안분 비율로 분담. 본 계산은 상한 기준 참고치이며 실제
            확정액은 법원 결정에 따릅니다.
          </p>
        </div>
      </section>

      {/* 변호사법 준수 고지 (2026 대법원 로폼 판결 기준) */}
      <section className="mt-10 rounded-xl border border-gray-300 bg-gray-50 p-5 dark:border-gray-700 dark:bg-gray-800/50">
        <p className="text-sm font-bold">⚖️ 변호사법 준수 고지</p>
        <p className="mt-2 text-xs leading-5 text-gray-600 dark:text-gray-400">
          {COMPLIANCE_NOTICE}
        </p>
      </section>
    </div>
  );
}

function Block({
  n,
  title,
  children,
}: {
  n: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="mt-5 border-t border-gray-100 pt-4 dark:border-gray-800">
      <p className="mb-2 text-sm font-bold">
        <span className="mr-2 text-gray-400">{n})</span>
        {title}
      </p>
      {children}
    </div>
  );
}

function KV({
  label,
  items,
  muted,
}: {
  label: string;
  items: string[];
  muted?: boolean;
}) {
  if (items.length === 0) return null;
  return (
    <div className="mt-1 flex gap-3 text-sm">
      <span className="w-20 shrink-0 font-semibold text-gray-500">{label}</span>
      <ul className={`flex-1 space-y-0.5 ${muted ? "text-gray-400" : "text-gray-600 dark:text-gray-400"}`}>
        {items.map((it) => (
          <li key={it}>· {it}</li>
        ))}
      </ul>
    </div>
  );
}
