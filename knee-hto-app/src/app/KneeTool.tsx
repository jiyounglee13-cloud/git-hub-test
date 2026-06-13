"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  computeAlignment,
  computeCorrection,
  computeTibialSlope,
  currentWblPercent,
  FUJISAWA_TARGET_PCT,
  LANDMARK_DEFS,
  type LandmarkKey,
  type Landmarks,
  type Point,
  SCENARIOS,
  SLOPE_LANDMARK_DEFS,
  type SlopeLandmarkKey,
  type SlopeLandmarks,
} from "@/lib/hto";
import { isDicomFile, renderDicomToDataUrl } from "@/lib/dicom";

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
  view_adequacy: string;
  backend: string;
  agreement: number | null;
  mock: boolean;
}

type Laterality = "left" | "right" | "unknown";
type ViewType =
  | "ap_weightbearing"
  | "ap_supine"
  | "lateral"
  | "rosenberg"
  | "unknown";

const VIEW_LABELS: Record<ViewType, string> = {
  ap_weightbearing: "체중부하 AP (표준)",
  ap_supine: "비체중부하 AP",
  lateral: "측면상",
  rosenberg: "Rosenberg(굴곡 PA)",
  unknown: "미지정",
};

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

  const [laterality, setLaterality] = useState<Laterality>("unknown");
  const [viewType, setViewType] = useState<ViewType>("ap_weightbearing");
  const [tibialSlopeDeg, setTibialSlopeDeg] = useState("");
  const [loadError, setLoadError] = useState<string | null>(null);

  // 드래그 미세조정 / 측면상 슬로프 모드
  const draggingRef = useRef<{ kind: "ap" | "slope"; key: string } | null>(null);
  const [slopeMode, setSlopeMode] = useState(false);
  const [slopeLandmarks, setSlopeLandmarks] = useState<SlopeLandmarks>({});
  const [slopePlacing, setSlopePlacing] = useState<SlopeLandmarkKey | null>(
    null
  );

  // ---------- 이미지/DICOM 로드 ----------
  const loadImageFromDataUrl = useCallback(
    (dataUrl: string, mt: string) => {
      const base64 = dataUrl.split(",")[1] ?? "";
      setImageBase64(base64);
      setMediaType(mt);
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
        setSlopeLandmarks({});
        setAnalysis(null);
        setView("before");
      };
      img.src = dataUrl;
    },
    []
  );

  const handleFile = useCallback(
    (file: File) => {
      setLoadError(null);
      if (isDicomFile(file)) {
        const reader = new FileReader();
        reader.onload = () => {
          try {
            const url = renderDicomToDataUrl(reader.result as ArrayBuffer);
            // 서버 추론에는 PNG로 변환된 영상을 전달
            loadImageFromDataUrl(url, "image/png");
          } catch (err) {
            setLoadError(
              err instanceof Error ? err.message : "DICOM 로드 실패"
            );
          }
        };
        reader.readAsArrayBuffer(file);
      } else {
        const reader = new FileReader();
        reader.onload = () =>
          loadImageFromDataUrl(
            reader.result as string,
            file.type || "image/jpeg"
          );
        reader.readAsDataURL(file);
      }
    },
    [loadImageFromDataUrl]
  );

  // ---------- LLM 추론 호출 ----------
  const analyze = useCallback(async () => {
    if (!imageBase64) return;
    setAnalyzing(true);
    setAnalysis(null);
    try {
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          imageBase64,
          mediaType,
          laterality,
          view: viewType,
        }),
      });
      const data = await res.json();
      setAnalysis(data);
    } catch {
      setAnalysis(null);
    } finally {
      setAnalyzing(false);
    }
  }, [imageBase64, mediaType, laterality, viewType]);

  // 화면 좌표 → 캔버스 좌표
  const toCanvasCoords = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current!;
    const rect = canvas.getBoundingClientRect();
    return {
      x: ((e.clientX - rect.left) / rect.width) * canvas.width,
      y: ((e.clientY - rect.top) / rect.height) * canvas.height,
    };
  }, []);

  // ---------- 캔버스 클릭 → 랜드마크 배치 ----------
  const handleCanvasClick = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement>) => {
      if (!canvasRef.current) return;
      const p = toCanvasCoords(e);
      if (slopeMode) {
        if (!slopePlacing) return;
        setSlopeLandmarks((prev) => ({ ...prev, [slopePlacing]: p }));
        const order = SLOPE_LANDMARK_DEFS.map((d) => d.key);
        const next = order.find(
          (k) => k !== slopePlacing && !slopeLandmarks[k]
        );
        setSlopePlacing(next ?? null);
        return;
      }
      if (!placing) return;
      setLandmarks((prev) => ({ ...prev, [placing]: p }));
      const requiredOrder = LANDMARK_DEFS.filter((d) => !d.optional).map(
        (d) => d.key
      );
      const next = requiredOrder.find((k) => k !== placing && !landmarks[k]);
      setPlacing(next ?? null);
    },
    [placing, landmarks, slopeMode, slopePlacing, slopeLandmarks, toCanvasCoords]
  );

  // ---------- 드래그 미세조정 ----------
  const handleMouseDown = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement>) => {
      if ((slopeMode && slopePlacing) || (!slopeMode && placing)) return; // 배치 모드 중엔 드래그 안 함
      const p = toCanvasCoords(e);
      const HIT = 12;
      if (slopeMode) {
        for (const d of SLOPE_LANDMARK_DEFS) {
          const lp = slopeLandmarks[d.key];
          if (lp && Math.hypot(lp.x - p.x, lp.y - p.y) <= HIT) {
            draggingRef.current = { kind: "slope", key: d.key };
            return;
          }
        }
      } else {
        for (const d of LANDMARK_DEFS) {
          const lp = landmarks[d.key];
          if (lp && Math.hypot(lp.x - p.x, lp.y - p.y) <= HIT) {
            draggingRef.current = { kind: "ap", key: d.key };
            return;
          }
        }
      }
    },
    [slopeMode, slopePlacing, placing, landmarks, slopeLandmarks, toCanvasCoords]
  );

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement>) => {
      const drag = draggingRef.current;
      if (!drag) return;
      const p = toCanvasCoords(e);
      if (drag.kind === "slope") {
        setSlopeLandmarks((prev) => ({
          ...prev,
          [drag.key as SlopeLandmarkKey]: p,
        }));
      } else {
        setLandmarks((prev) => ({ ...prev, [drag.key as LandmarkKey]: p }));
      }
    },
    [toCanvasCoords]
  );

  const endDrag = useCallback(() => {
    draggingRef.current = null;
  }, []);

  const correction = computeCorrection(landmarks, targetPct, tibiaWidthMm);
  const curPct = currentWblPercent(landmarks);
  const alignment = computeAlignment(landmarks);

  const requiredKeys = LANDMARK_DEFS.filter((d) => !d.optional).map(
    (d) => d.key
  );
  const requiredPlaced = requiredKeys.filter((k) => landmarks[k]).length;
  const placingDef = LANDMARK_DEFS.find((d) => d.key === placing);

  const slopeValue = computeTibialSlope(slopeLandmarks);
  // 유효 후방 경사: 측면상 자동 계측값 우선, 없으면 수동 입력값
  const manualSlope =
    tibialSlopeDeg.trim() !== "" && isFinite(Number(tibialSlopeDeg))
      ? Number(tibialSlopeDeg)
      : null;
  const effectiveSlope = slopeValue != null ? slopeValue : manualSlope;

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

    const showAfter = !slopeMode && view === "after" && correction;

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

    // ----- 측면상 슬로프 모드 오버레이 -----
    if (slopeMode) {
      const { axisProximal, axisDistal, plateauAnterior, plateauPosterior } =
        slopeLandmarks;
      if (axisProximal && axisDistal)
        strokeLine(ctx, axisProximal, axisDistal, "#0ea5e9", 2);
      if (plateauAnterior && plateauPosterior)
        strokeLine(ctx, plateauAnterior, plateauPosterior, "#22c55e", 2);
      for (const def of SLOPE_LANDMARK_DEFS) {
        const p = slopeLandmarks[def.key];
        if (p) drawDot(ctx, p, def.color);
      }
      if (slopeValue != null && plateauAnterior)
        drawDot(ctx, plateauPosterior!, "#22c55e", `slope ${slopeValue}°`);
      return;
    }

    // ----- AP 정렬 오버레이 -----
    const { hip, ankle, medial, lateral, hinge, femMedial, femLateral } =
      landmarks;

    if (medial && lateral) strokeLine(ctx, medial, lateral, "#f59e0b", 2);
    if (femMedial && femLateral)
      strokeLine(ctx, femMedial, femLateral, "#ec4899", 2);

    if (hip && ankle && (view === "before" || !correction)) {
      strokeLine(ctx, hip, ankle, "#ef4444", 2, [6, 4]);
    }
    if (view === "after" && correction && hip) {
      strokeLine(ctx, hip, correction.newAnkle, "#22c55e", 2.5);
      drawDot(ctx, correction.fujisawa, "#22c55e", "목표");
    }

    if (hip && ankle && medial && lateral && curPct !== null) {
      const p = lerp(medial, lateral, curPct / 100);
      drawDot(ctx, p, "#ef4444", `${curPct.toFixed(0)}%`);
    }

    if (view === "after" && correction && hinge && medial && lateral) {
      const dir = norm(sub(lateral, medial));
      const a = { x: hinge.x - dir.x * 200, y: hinge.y - dir.y * 200 };
      const b = { x: hinge.x + dir.x * 200, y: hinge.y + dir.y * 200 };
      strokeLine(ctx, a, b, "#a855f7", 1.5, [4, 4]);
    }

    for (const def of LANDMARK_DEFS) {
      const p = landmarks[def.key];
      if (p) drawDot(ctx, p, def.color);
    }
  }, [
    imageLoaded,
    drawSize,
    landmarks,
    view,
    correction,
    curPct,
    slopeMode,
    slopeLandmarks,
    slopeValue,
  ]);

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
            이미지 / DICOM 선택
            <input
              type="file"
              accept="image/*,.dcm,.dicom,application/dicom"
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
            JPG/PNG 또는 비압축 DICOM(.dcm)
          </span>
        </div>
        {loadError && (
          <p className="mt-2 rounded-lg border border-red-300 bg-red-50 p-2 text-xs text-red-700 dark:border-red-800 dark:bg-red-950/40 dark:text-red-300">
            ⚠ {loadError}
          </p>
        )}
        <div className="mt-3 flex flex-wrap gap-4 text-xs">
          <label className="flex items-center gap-1.5">
            <span className="text-gray-500">무릎</span>
            <select
              value={laterality}
              onChange={(e) => setLaterality(e.target.value as Laterality)}
              className="rounded border border-gray-300 px-2 py-1 dark:border-gray-700 dark:bg-gray-800"
            >
              <option value="unknown">미지정</option>
              <option value="left">좌 (Left)</option>
              <option value="right">우 (Right)</option>
            </select>
          </label>
          <label className="flex items-center gap-1.5">
            <span className="text-gray-500">촬영자세</span>
            <select
              value={viewType}
              onChange={(e) => setViewType(e.target.value as ViewType)}
              className="rounded border border-gray-300 px-2 py-1 dark:border-gray-700 dark:bg-gray-800"
            >
              {(Object.keys(VIEW_LABELS) as ViewType[]).map((v) => (
                <option key={v} value={v}>
                  {VIEW_LABELS[v]}
                </option>
              ))}
            </select>
          </label>
          {viewType !== "ap_weightbearing" && (
            <span className="self-center text-amber-600">
              ⚠ K&amp;L은 체중부하 AP가 표준 — 다른 자세는 등급 신뢰도가 낮습니다.
            </span>
          )}
        </div>
      </section>

      {imageLoaded && (
        <div className="grid gap-8 lg:grid-cols-[auto_1fr]">
          {/* 캔버스 */}
          <section className="space-y-3">
            <canvas
              ref={canvasRef}
              onClick={handleCanvasClick}
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={endDrag}
              onMouseLeave={endDrag}
              className={`rounded-xl border border-gray-300 dark:border-gray-700 ${
                (slopeMode ? slopePlacing : placing)
                  ? "cursor-crosshair"
                  : "cursor-grab"
              }`}
              style={{ width: drawSize.w, height: drawSize.h, maxWidth: "100%" }}
            />
            <p className="text-[11px] text-gray-400">
              점을 배치한 뒤에는 <b>드래그</b>로 미세조정할 수 있습니다.
            </p>
            {/* 측면상 슬로프 모드 토글 */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  setSlopeMode((v) => !v);
                  setPlacing(null);
                  setSlopePlacing(null);
                }}
                className={`rounded-md px-3 py-1 text-xs font-semibold ${
                  slopeMode
                    ? "bg-sky-600 text-white"
                    : "border border-sky-400 text-sky-600"
                }`}
              >
                {slopeMode ? "← AP 정렬 모드로" : "측면상 슬로프 측정 모드"}
              </button>
              {slopeMode && slopeValue != null && (
                <span className="text-xs font-semibold text-sky-600">
                  후방 경골 경사 {slopeValue}° (자동 반영됨)
                </span>
              )}
            </div>
            {/* 측면상 슬로프 랜드마크 컨트롤 */}
            {slopeMode && (
              <div className="rounded-xl border border-sky-200 bg-sky-50 p-3 dark:border-sky-900 dark:bg-sky-950/30">
                <p className="mb-2 text-xs font-semibold text-sky-700 dark:text-sky-300">
                  측면(lateral) 영상에서 4점을 찍으면 후방 경골 경사가 자동
                  계측됩니다. (경골축 2점 + 평탄부 전/후연 2점)
                </p>
                <div className="flex flex-wrap gap-2">
                  {SLOPE_LANDMARK_DEFS.map((d) => (
                    <button
                      key={d.key}
                      onClick={() => setSlopePlacing(d.key)}
                      className={`rounded-md px-2.5 py-1 text-xs font-medium ${
                        slopePlacing === d.key
                          ? "ring-2 ring-offset-1"
                          : slopeLandmarks[d.key]
                          ? "opacity-100"
                          : "opacity-60"
                      }`}
                      style={{
                        backgroundColor: slopeLandmarks[d.key]
                          ? d.color + "22"
                          : "#e5e7eb44",
                        color: d.color,
                      }}
                    >
                      {slopeLandmarks[d.key] ? "✓ " : "○ "}
                      {d.label}
                    </button>
                  ))}
                  <button
                    onClick={() => setSlopeLandmarks({})}
                    className="rounded-md px-2.5 py-1 text-xs text-gray-500 underline"
                  >
                    초기화
                  </button>
                </div>
              </div>
            )}
            {/* AP 랜드마크 컨트롤 */}
            {!slopeMode && (
            <div className="rounded-xl border border-gray-200 bg-gray-50 p-3 dark:border-gray-800 dark:bg-gray-900/50">
              <p className="mb-1 text-xs font-semibold text-gray-600 dark:text-gray-400">
                ② 랜드마크 보정 · 필수{" "}
                <span
                  className={
                    requiredPlaced === requiredKeys.length
                      ? "text-[var(--primary)]"
                      : "text-amber-600"
                  }
                >
                  {requiredPlaced}/{requiredKeys.length}
                </span>{" "}
                · 대퇴 과 2점은 JLCA·mLDFA 산출용 <b>선택</b>
              </p>
              <p className="mb-2 text-[11px] text-gray-500">
                {placingDef ? (
                  <>
                    <b style={{ color: placingDef.color }}>
                      {placingDef.label}
                    </b>{" "}
                    위치를 영상에서 클릭하세요. 잘못 찍으면 해당 버튼을 다시 눌러
                    재배치합니다.
                  </>
                ) : (
                  "버튼을 누른 뒤 영상 위를 클릭해 배치합니다."
                )}
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
                    {d.optional ? " (선택)" : ""}
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
            )}
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
                  필수 5개 랜드마크(대퇴 과 2점 제외)를 모두 찍으면 교정각이
                  계산됩니다.
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

                  {/* 정렬 각도 */}
                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                    <Stat
                      label="HKA 편위"
                      value={
                        alignment
                          ? `${Math.abs(alignment.hkaDeviation).toFixed(1)}° ${
                              alignment.side === "varus"
                                ? "내반"
                                : alignment.side === "valgus"
                                ? "외반"
                                : "중립"
                            }`
                          : "—"
                      }
                    />
                    <Stat
                      label="현재 MPTA"
                      value={
                        correction.currentMpta != null
                          ? `${correction.currentMpta.toFixed(1)}°`
                          : "—"
                      }
                    />
                    <Stat
                      label="교정 후 MPTA"
                      value={
                        correction.predictedMpta != null
                          ? `${correction.predictedMpta.toFixed(1)}°`
                          : "—"
                      }
                    />
                    <Stat
                      label="JLCA"
                      value={
                        alignment?.jlca != null
                          ? `${alignment.jlca.toFixed(1)}°`
                          : "대퇴 과 필요"
                      }
                    />
                    <Stat
                      label="mLDFA"
                      value={
                        alignment?.mldfa != null
                          ? `${alignment.mldfa.toFixed(1)}°`
                          : "대퇴 과 필요"
                      }
                    />
                    <Stat
                      label="후방 경골 경사"
                      value={
                        effectiveSlope != null
                          ? `${effectiveSlope}°${
                              slopeValue != null ? " (자동)" : " (수동)"
                            }`
                          : "측면상 필요"
                      }
                    />
                  </div>

                  {/* 안전·금기 경고 */}
                  {(correction.warnings.length > 0 ||
                    analysis?.kl_grade === 4) && (
                    <ul className="space-y-1 rounded-lg border border-red-200 bg-red-50 p-3 text-xs text-red-700 dark:border-red-900 dark:bg-red-950/40 dark:text-red-300">
                      {analysis?.kl_grade === 4 && (
                        <li>
                          ⛔ K&amp;L 4등급(연골 소실): 내측 개방 HTO는 일반적
                          금기 — 관절치환술 등 대안을 우선 고려.
                        </li>
                      )}
                      {correction.warnings.map((w, i) => (
                        <li key={i}>⚠ {w}</li>
                      ))}
                    </ul>
                  )}

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
                    <div className="flex flex-wrap gap-4">
                      <label className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400">
                        <span title="찍은 내측·외측 평탄부 두 점의 실제 좌우 폭. 픽셀→mm 환산 기준이 되어 쐐기 높이에 직접 영향합니다 (성인 약 70~85mm).">
                          경골 평탄부 폭(캘리브레이션) ⓘ:
                        </span>
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
                      <label className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400">
                        후방 경골 경사(측면상에서 측정):
                        <input
                          type="number"
                          value={tibialSlopeDeg}
                          placeholder="예: 8"
                          onChange={(e) => setTibialSlopeDeg(e.target.value)}
                          className="w-16 rounded border border-gray-300 px-1.5 py-0.5 dark:border-gray-700 dark:bg-gray-800"
                        />
                        °
                      </label>
                    </div>
                  </div>
                  <p className="rounded-lg bg-violet-50 p-2 text-[11px] text-violet-700 dark:bg-violet-950/40 dark:text-violet-300">
                    후방 경골 경사는 <b>측면(lateral) 영상</b>에서만 측정됩니다(정면상
                    불가). 내측 개방 HTO는 경사를 <b>증가</b>시키는 경향이 있어
                    ACL 부족 슬관절에서 주의가 필요합니다
                    {effectiveSlope != null &&
                      effectiveSlope >= 12 &&
                      " — 현재 경사가 이미 높아 추가 증가에 유의."}
                    .
                  </p>

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
                    수술 결과 예측이 아닙니다. 각도·쐐기 값은 손으로 찍은 랜드마크에
                    민감하므로 0.5° / 0.5mm 단위로 반올림해 표기합니다.
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
      <div className="mb-3 flex items-center justify-between gap-2">
        <h3 className="text-base font-bold">K&L 등급 판독</h3>
        <div className="flex flex-wrap justify-end gap-1.5">
          <span className="rounded-full bg-gray-100 px-2 py-0.5 text-[11px] font-medium text-gray-600 dark:bg-gray-800 dark:text-gray-300">
            backend: {analysis.backend}
          </span>
          {analysis.agreement != null && (
            <span className="rounded-full bg-gray-100 px-2 py-0.5 text-[11px] font-medium text-gray-600 dark:bg-gray-800 dark:text-gray-300">
              표본 일치율 {(analysis.agreement * 100).toFixed(0)}%
            </span>
          )}
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

      {analysis.mock && (
        <p className="mb-3 rounded-lg border border-gray-300 bg-gray-100 p-2 text-[11px] text-gray-600 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300">
          ※ <b>모의(placeholder) 결과</b> — 아래 등급은 업로드한 영상과
          무관하게 고정 출력됩니다. 실제 추정은 서버에 ANTHROPIC_API_KEY 설정
          시 동작합니다.
        </p>
      )}

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
      <p className="mt-2 rounded-lg bg-sky-50 p-2 text-[11px] text-sky-700 dark:bg-sky-950/40 dark:text-sky-300">
        <b>영상 적합성:</b> {analysis.view_adequacy}
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
