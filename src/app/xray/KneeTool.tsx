"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  computeCorrection,
  currentWblPercent,
  FUJISAWA_TARGET_PCT,
  LANDMARK_DEFS,
  type LandmarkKey,
  type Landmarks,
  type Point,
  SCENARIOS,
} from "@/lib/hto";

interface Analysis {
  kl_grade: number;
  stage: string;
  confidence: "low" | "medium" | "high";
  findings: {
    osteophyte: string;
    jsn_medial: string;
    jsn_lateral: string;
    subchondral: string;
  };
  varus_valgus_impression: string;
  reasoning: string;
  limitations: string;
  mock: boolean;
}

const MAX_W = 560;
const MAX_H = 620;

const GRADE_COLORS = [
  "#16a34a",
  "#84cc16",
  "#f59e0b",
  "#f97316",
  "#dc2626",
];

export default function KneeTool() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imgRef = useRef<HTMLImageElement | null>(null);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [mediaType, setMediaType] = useState("image/jpeg");
  const [imageBase64, setImageBase64] = useState<string | null>(null);
  const [drawSize, setDrawSize] = useState({ w: MAX_W, h: 400 });

  const [analysis, setAnalysis] = useState<Analysis | null>(null);
  const [analyzing, setAnalyzing] = useState(false);

  const [landmarks, setLandmarks] = useState<Landmarks>({});
  const [placing, setPlacing] = useState<LandmarkKey | null>(null);

  const [targetPct, setTargetPct] = useState(FUJISAWA_TARGET_PCT);
  const [tibiaWidthMm, setTibiaWidthMm] = useState(75);
  const [view, setView] = useState<"before" | "after">("before");

  // ---------- 이미지 업로드 ----------
  const handleFile = useCallback((file: File) => {
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      const base64 = dataUrl.split(",")[1] ?? "";
      setImageBase64(base64);
      setMediaType(file.type || "image/jpeg");
      const img = new Image();
      img.onload = () => {
        const scale = Math.min(MAX_W / img.width, MAX_H / img.height, 1);
        setDrawSize({
          w: Math.round(img.width * scale),
          h: Math.round(img.height * scale),
        });
        imgRef.current = img;
        setImageLoaded(true);
        setLandmarks({});
        setAnalysis(null);
        setView("before");
      };
      img.src = dataUrl;
    };
    reader.readAsDataURL(file);
  }, []);

  // ---------- LLM 추론 호출 ----------
  const analyze = useCallback(async () => {
    if (!imageBase64) return;
    setAnalyzing(true);
    setAnalysis(null);
    try {
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ imageBase64, mediaType }),
      });
      const data = await res.json();
      setAnalysis(data);
    } catch {
      setAnalysis(null);
    } finally {
      setAnalyzing(false);
    }
  }, [imageBase64, mediaType]);

  // ---------- 캔버스 클릭 → 랜드마크 ----------
  const handleCanvasClick = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement>) => {
      if (!placing) return;
      const canvas = canvasRef.current;
      if (!canvas) return;
      const rect = canvas.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * canvas.width;
      const y = ((e.clientY - rect.top) / rect.height) * canvas.height;
      setLandmarks((prev) => ({ ...prev, [placing]: { x, y } }));
      // 다음 미배치 랜드마크로 자동 이동
      const order = LANDMARK_DEFS.map((d) => d.key);
      const next = order.find(
        (k) => k !== placing && !landmarks[k]
      );
      setPlacing(next ?? null);
    },
    [placing, landmarks]
  );

  const correction = computeCorrection(landmarks, targetPct, tibiaWidthMm);
  const curPct = currentWblPercent(landmarks);

  // ---------- 캔버스 렌더 ----------
  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    const img = imgRef.current;
    if (!canvas || !img || !imageLoaded) return;
    canvas.width = drawSize.w;
    canvas.height = drawSize.h;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const showAfter = view === "after" && correction;

    if (showAfter && correction) {
      // 절골선: 경첩(hinge)을 지나며 평탄부(medial-lateral) 방향과 평행
      const { hinge } = landmarks as Required<Landmarks>;
      // 상부(근위) 절편: 전체 이미지 그리기
      ctx.drawImage(img, 0, 0, drawSize.w, drawSize.h);
      // 하부(원위) 절편: 경첩 중심으로 회전시켜 덧그리기
      ctx.save();
      // 원위측 절반만 클립 (회전 좌표계 기준)
      ctx.translate(hinge.x, hinge.y);
      ctx.rotate(correction.rotationRad);
      ctx.translate(-hinge.x, -hinge.y);
      ctx.beginPath();
      // 경첩 y 아래쪽을 원위 절편으로 간주 (데모 근사)
      ctx.rect(0, hinge.y, drawSize.w, drawSize.h - hinge.y);
      ctx.clip();
      ctx.drawImage(img, 0, 0, drawSize.w, drawSize.h);
      ctx.restore();
    } else {
      ctx.drawImage(img, 0, 0, drawSize.w, drawSize.h);
    }

    // ----- 오버레이 -----
    const { hip, ankle, medial, lateral, hinge } = landmarks;

    // 평탄부 선
    if (medial && lateral) {
      strokeLine(ctx, medial, lateral, "#f59e0b", 2);
    }

    // 역학축 (before: 현재, after: 교정)
    if (hip && ankle) {
      if (view === "before" || !correction) {
        strokeLine(ctx, hip, ankle, "#ef4444", 2, [6, 4]);
      }
    }
    if (view === "after" && correction && hip) {
      strokeLine(ctx, hip, correction.newAnkle, "#22c55e", 2.5);
      drawDot(ctx, correction.fujisawa, "#22c55e", "목표");
    }

    // 현재 WBL 점
    if (hip && ankle && medial && lateral && curPct !== null) {
      const p = lerp(medial, lateral, curPct / 100);
      drawDot(ctx, p, "#ef4444", `${curPct.toFixed(0)}%`);
    }

    // 절골선 (after)
    if (view === "after" && correction && hinge && medial && lateral) {
      const dir = norm(sub(lateral, medial));
      const a = { x: hinge.x - dir.x * 200, y: hinge.y - dir.y * 200 };
      const b = { x: hinge.x + dir.x * 200, y: hinge.y + dir.y * 200 };
      strokeLine(ctx, a, b, "#a855f7", 1.5, [4, 4]);
    }

    // 랜드마크 점
    for (const def of LANDMARK_DEFS) {
      const p = landmarks[def.key];
      if (p) drawDot(ctx, p, def.color);
    }
  }, [imageLoaded, drawSize, landmarks, view, correction, curPct]);

  useEffect(() => {
    draw();
  }, [draw]);

  // ---------- 렌더 ----------
  return (
    <div className="space-y-8">
      {/* 업로드 */}
      <section className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900">
        <h2 className="mb-3 text-lg font-bold">① 무릎 X-ray 업로드 & 스캔</h2>
        <div className="flex flex-wrap items-center gap-3">
          <label className="cursor-pointer rounded-lg bg-[var(--primary)] px-4 py-2 text-sm font-semibold text-white hover:opacity-90">
            이미지 선택
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) handleFile(f);
              }}
            />
          </label>
          <button
            onClick={analyze}
            disabled={!imageLoaded || analyzing}
            className="rounded-lg border border-[var(--primary)] px-4 py-2 text-sm font-semibold text-[var(--primary)] disabled:opacity-40"
          >
            {analyzing ? "스캔 중…" : "🔍 스캔하기 (K&L 판독)"}
          </button>
          <span className="text-xs text-gray-500">
            화면 캡처/사진 대신 업로드 방식 (데모 안정성)
          </span>
        </div>
      </section>

      {imageLoaded && (
        <div className="grid gap-8 lg:grid-cols-[auto_1fr]">
          {/* 캔버스 */}
          <section className="space-y-3">
            <canvas
              ref={canvasRef}
              onClick={handleCanvasClick}
              className={`rounded-xl border border-gray-300 dark:border-gray-700 ${
                placing ? "cursor-crosshair" : "cursor-default"
              }`}
              style={{ width: drawSize.w, height: drawSize.h, maxWidth: "100%" }}
            />
            {/* 랜드마크 컨트롤 */}
            <div className="rounded-xl border border-gray-200 bg-gray-50 p-3 dark:border-gray-800 dark:bg-gray-900/50">
              <p className="mb-2 text-xs font-semibold text-gray-600 dark:text-gray-400">
                ② 랜드마크 보정 (버튼 클릭 후 영상 위를 클릭)
              </p>
              <div className="flex flex-wrap gap-2">
                {LANDMARK_DEFS.map((d) => (
                  <button
                    key={d.key}
                    onClick={() => setPlacing(d.key)}
                    className={`rounded-md px-2.5 py-1 text-xs font-medium ${
                      placing === d.key
                        ? "ring-2 ring-offset-1"
                        : landmarks[d.key]
                        ? "opacity-100"
                        : "opacity-60"
                    }`}
                    style={{
                      backgroundColor: landmarks[d.key]
                        ? d.color + "22"
                        : "#e5e7eb44",
                      color: d.color,
                    }}
                  >
                    {landmarks[d.key] ? "✓ " : "○ "}
                    {d.label}
                  </button>
                ))}
                <button
                  onClick={() => {
                    setLandmarks({});
                    setView("before");
                  }}
                  className="rounded-md px-2.5 py-1 text-xs text-gray-500 underline"
                >
                  초기화
                </button>
              </div>
            </div>
          </section>

          {/* 결과 패널 */}
          <section className="space-y-6">
            {/* K&L */}
            {analysis && <KLPanel analysis={analysis} />}

            {/* HTO 계산기 */}
            <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-900">
              <h3 className="mb-3 text-base font-bold">
                ③ HTO 교정각 계산기 (기하 — LLM 아님)
              </h3>
              {!correction ? (
                <p className="text-sm text-gray-500">
                  5개 랜드마크를 모두 찍으면 교정각이 계산됩니다.
                  {curPct !== null && (
                    <>
                      {" "}
                      현재 WBL: {curPct.toFixed(0)}% (내측 기준)
                    </>
                  )}
                </p>
              ) : (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                    <Stat
                      label="현재 WBL"
                      value={`${correction.currentPct.toFixed(0)}%`}
                    />
                    <Stat
                      label="목표 WBL"
                      value={`${correction.targetPct.toFixed(0)}%`}
                    />
                    <Stat
                      label="교정각"
                      value={`${correction.correctionDeg.toFixed(1)}°`}
                      highlight
                    />
                    <Stat
                      label="개대 쐐기"
                      value={
                        correction.wedgeHeightMm != null
                          ? `${correction.wedgeHeightMm.toFixed(1)} mm`
                          : "—"
                      }
                      highlight
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="flex items-center justify-between text-xs text-gray-600 dark:text-gray-400">
                      <span>목표 WBL 위치 (Fujisawa 62%)</span>
                      <span className="font-mono">{targetPct}%</span>
                    </label>
                    <input
                      type="range"
                      min={45}
                      max={75}
                      value={targetPct}
                      onChange={(e) => setTargetPct(Number(e.target.value))}
                      className="w-full accent-[var(--primary)]"
                    />
                    <label className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400">
                      경골 평탄부 폭(캘리브레이션):
                      <input
                        type="number"
                        value={tibiaWidthMm}
                        onChange={(e) =>
                          setTibiaWidthMm(Number(e.target.value))
                        }
                        className="w-16 rounded border border-gray-300 px-1.5 py-0.5 dark:border-gray-700 dark:bg-gray-800"
                      />
                      mm
                    </label>
                  </div>

                  {/* Before / After 토글 */}
                  <div className="flex gap-2">
                    {(["before", "after"] as const).map((v) => (
                      <button
                        key={v}
                        onClick={() => setView(v)}
                        className={`flex-1 rounded-lg py-2 text-sm font-semibold ${
                          view === v
                            ? "bg-[var(--primary)] text-white"
                            : "border border-gray-300 text-gray-600 dark:border-gray-700 dark:text-gray-400"
                        }`}
                      >
                        {v === "before" ? "Before (현재)" : "After (교정 시뮬레이션)"}
                      </button>
                    ))}
                  </div>
                  <p className="text-[11px] text-gray-400">
                    ※ After 영상은 경첩 중심 회전 <b>기하 시뮬레이션</b>이며 실제
                    수술 결과 예측이 아닙니다.
                  </p>
                </div>
              )}
            </div>

            {/* 시나리오 카드 */}
            {correction && (
              <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-900">
                <h3 className="mb-1 text-base font-bold">
                  ④ 연골 상태별 교정 시나리오
                </h3>
                <p className="mb-3 text-xs text-gray-500">
                  AI 자동판단이 아닌 <b>의사 선택용</b> 규칙기반 옵션. 카드를
                  누르면 목표 WBL이 적용됩니다.
                </p>
                <div className="grid gap-3 sm:grid-cols-3">
                  {SCENARIOS.map((s) => {
                    const c = computeCorrection(
                      landmarks,
                      s.targetPct,
                      tibiaWidthMm
                    );
                    return (
                      <button
                        key={s.id}
                        onClick={() => {
                          setTargetPct(s.targetPct);
                          setView("after");
                        }}
                        className={`rounded-xl border p-3 text-left transition hover:shadow-md ${toneClass(
                          s.tone
                        )}`}
                      >
                        <p className="text-sm font-bold">{s.title}</p>
                        <p className="mt-0.5 text-[11px] opacity-70">
                          {s.cartilage}
                        </p>
                        <div className="mt-2 flex items-baseline gap-2">
                          <span className="text-lg font-bold">
                            {c ? `${c.correctionDeg.toFixed(1)}°` : "—"}
                          </span>
                          <span className="text-[11px] opacity-70">
                            {c?.wedgeHeightMm != null
                              ? `· ${c.wedgeHeightMm.toFixed(1)}mm`
                              : ""}
                          </span>
                        </div>
                        <p className="mt-1.5 text-[11px] leading-snug opacity-80">
                          {s.note}
                        </p>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </section>
        </div>
      )}
    </div>
  );
}

// ---------- 하위 컴포넌트 ----------

function KLPanel({ analysis }: { analysis: Analysis }) {
  const color = GRADE_COLORS[analysis.kl_grade] ?? "#6b7280";
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-900">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-base font-bold">K&L 등급 판독</h3>
        <div className="flex gap-2">
          {analysis.mock && (
            <span className="rounded-full bg-gray-200 px-2 py-0.5 text-[11px] font-medium text-gray-600 dark:bg-gray-700 dark:text-gray-300">
              모의 추론
            </span>
          )}
          <span
            className="rounded-full px-2 py-0.5 text-[11px] font-medium"
            style={{ backgroundColor: color + "22", color }}
          >
            신뢰도 {analysis.confidence}
          </span>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div
          className="flex h-16 w-16 flex-col items-center justify-center rounded-2xl text-white"
          style={{ backgroundColor: color }}
        >
          <span className="text-2xl font-black leading-none">
            {analysis.kl_grade}
          </span>
          <span className="text-[10px]">등급</span>
        </div>
        <div>
          <p className="text-lg font-bold" style={{ color }}>
            {analysis.stage}
          </p>
          <p className="text-xs text-gray-500">
            {analysis.varus_valgus_impression}
          </p>
        </div>
        {/* 0~4 게이지 */}
        <div className="ml-auto flex gap-1">
          {GRADE_COLORS.map((c, i) => (
            <div
              key={i}
              className="h-8 w-3 rounded-sm"
              style={{
                backgroundColor: i === analysis.kl_grade ? c : c + "33",
              }}
            />
          ))}
        </div>
      </div>

      <dl className="mt-4 grid grid-cols-2 gap-2 text-xs">
        <Finding label="골극" value={analysis.findings.osteophyte} />
        <Finding label="연골하골" value={analysis.findings.subchondral} />
        <Finding label="내측 관절간격" value={analysis.findings.jsn_medial} />
        <Finding label="외측 관절간격" value={analysis.findings.jsn_lateral} />
      </dl>

      <p className="mt-3 rounded-lg bg-gray-50 p-2.5 text-xs text-gray-600 dark:bg-gray-800 dark:text-gray-400">
        <b>근거:</b> {analysis.reasoning}
      </p>
      <p className="mt-2 text-[11px] text-amber-600 dark:text-amber-500">
        ⚠ {analysis.limitations}
      </p>
    </div>
  );
}

function Finding({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border border-gray-100 p-2 dark:border-gray-800">
      <dt className="font-semibold text-gray-500">{label}</dt>
      <dd className="mt-0.5 text-gray-700 dark:text-gray-300">{value}</dd>
    </div>
  );
}

function Stat({
  label,
  value,
  highlight,
}: {
  label: string;
  value: string;
  highlight?: boolean;
}) {
  return (
    <div
      className={`rounded-lg p-2 text-center ${
        highlight
          ? "bg-[var(--primary)]/10"
          : "bg-gray-50 dark:bg-gray-800"
      }`}
    >
      <p className="text-[11px] text-gray-500">{label}</p>
      <p
        className={`text-base font-bold ${
          highlight ? "text-[var(--primary)]" : ""
        }`}
      >
        {value}
      </p>
    </div>
  );
}

function toneClass(tone: "amber" | "teal" | "sky") {
  switch (tone) {
    case "teal":
      return "border-teal-300 bg-teal-50 text-teal-800 dark:border-teal-800 dark:bg-teal-950/40 dark:text-teal-200";
    case "sky":
      return "border-sky-300 bg-sky-50 text-sky-800 dark:border-sky-800 dark:bg-sky-950/40 dark:text-sky-200";
    case "amber":
      return "border-amber-300 bg-amber-50 text-amber-800 dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-200";
  }
}

// ---------- 캔버스 헬퍼 ----------
function strokeLine(
  ctx: CanvasRenderingContext2D,
  a: Point,
  b: Point,
  color: string,
  width: number,
  dash?: number[]
) {
  ctx.save();
  ctx.strokeStyle = color;
  ctx.lineWidth = width;
  if (dash) ctx.setLineDash(dash);
  ctx.beginPath();
  ctx.moveTo(a.x, a.y);
  ctx.lineTo(b.x, b.y);
  ctx.stroke();
  ctx.restore();
}

function drawDot(
  ctx: CanvasRenderingContext2D,
  p: Point,
  color: string,
  label?: string
) {
  ctx.save();
  ctx.fillStyle = color;
  ctx.strokeStyle = "#fff";
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.arc(p.x, p.y, 5, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
  if (label) {
    ctx.fillStyle = color;
    ctx.font = "bold 11px sans-serif";
    ctx.fillText(label, p.x + 8, p.y - 6);
  }
  ctx.restore();
}

function sub(a: Point, b: Point): Point {
  return { x: a.x - b.x, y: a.y - b.y };
}
function norm(a: Point): Point {
  const l = Math.hypot(a.x, a.y) || 1;
  return { x: a.x / l, y: a.y / l };
}
function lerp(a: Point, b: Point, t: number): Point {
  return { x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t };
}
