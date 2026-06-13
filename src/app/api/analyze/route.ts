import { NextRequest, NextResponse } from "next/server";

// 무릎 X-ray K&L 판독 — LLM 추론형 엔드포인트.
//
// ANTHROPIC_API_KEY 가 설정되어 있으면 Claude 비전으로 실제 추론하고,
// 없거나 호출 실패 시 결정론적 모의(mock) 결과로 폴백하여 데모가 항상 동작합니다.
//
// LLM 은 "정성 판독(등급·소견)"만 담당합니다. 각도·거리 등 수치 측정은
// 클라이언트의 랜드마크 기하 계산(hto.ts)이 담당합니다.

export const runtime = "nodejs";

interface AnalysisFindings {
  osteophyte: string;
  jsn_medial: string;
  jsn_lateral: string;
  subchondral: string;
}

interface AnalysisResult {
  kl_grade: number;
  stage: string;
  confidence: "low" | "medium" | "high";
  findings: AnalysisFindings;
  varus_valgus_impression: string;
  reasoning: string;
  limitations: string;
  mock: boolean;
}

const STAGE_BY_GRADE: Record<number, string> = {
  0: "정상",
  1: "의심 (초기 이전)",
  2: "초기",
  3: "중기",
  4: "말기",
};

const SYSTEM_PROMPT = `당신은 근골격계 영상 판독을 보조하는 도구입니다. 제공된 무릎 X-ray를 보고 Kellgren-Lawrence(K&L) 등급(0~4)을 추정하세요.

평가 기준:
- 골극(osteophyte) 형성 여부와 위치
- 관절간격 협착(joint space narrowing) — 내측/외측 구획 별도
- 연골하골 경화(subchondral sclerosis)
- 전반적 내반/외반 정렬 인상

반드시 아래 JSON 스키마로만 응답하세요. 다른 텍스트 없이 JSON만 출력합니다:
{
  "kl_grade": <0~4 정수>,
  "confidence": "<low|medium|high>",
  "findings": {
    "osteophyte": "<한국어 소견>",
    "jsn_medial": "<한국어 소견>",
    "jsn_lateral": "<한국어 소견>",
    "subchondral": "<한국어 소견>"
  },
  "varus_valgus_impression": "<한국어 인상>",
  "reasoning": "<등급 판단 근거 한국어>"
}

주의: 연골 상태는 X-ray로 직접 평가할 수 없습니다(간접 추정만 가능). 단정하지 말고 추정임을 전제하세요.`;

function buildMock(): AnalysisResult {
  return {
    kl_grade: 2,
    stage: STAGE_BY_GRADE[2],
    confidence: "low",
    findings: {
      osteophyte: "경골 내측 가장자리에 경미한 골극 의심 (모의 결과)",
      jsn_medial: "내측 관절간격 경도 협착 가능성",
      jsn_lateral: "외측 관절간격 비교적 유지",
      subchondral: "뚜렷한 연골하골 경화 없음",
    },
    varus_valgus_impression: "경도 내반(varus) 정렬 의심",
    reasoning:
      "내측 관절간격 협착과 경미한 골극 소견으로 K&L 2등급(초기)에 부합. (※ API 키 미설정 — 결정론적 모의 추론 결과입니다.)",
    limitations:
      "본 결과는 ANTHROPIC_API_KEY 미설정 시 제공되는 모의 데이터입니다. 단일 정면 영상 기반 추정이며, 정렬·교정각 평가에는 전장하지 기립영상이 필요합니다.",
    mock: true,
  };
}

function coerceGrade(v: unknown): number {
  const n = Math.round(Number(v));
  if (Number.isNaN(n)) return 2;
  return Math.min(4, Math.max(0, n));
}

export async function POST(req: NextRequest) {
  let imageBase64: string | undefined;
  let mediaType = "image/jpeg";
  try {
    const body = await req.json();
    imageBase64 = body.imageBase64;
    if (typeof body.mediaType === "string") mediaType = body.mediaType;
  } catch {
    return NextResponse.json({ error: "잘못된 요청 본문" }, { status: 400 });
  }

  if (!imageBase64) {
    return NextResponse.json({ error: "이미지가 없습니다" }, { status: 400 });
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  const model = process.env.ANTHROPIC_MODEL || "claude-sonnet-4-6";

  // API 키가 없으면 모의 결과로 폴백 (데모 항상 동작)
  if (!apiKey) {
    return NextResponse.json(buildMock());
  }

  try {
    const resp = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model,
        max_tokens: 1024,
        system: SYSTEM_PROMPT,
        messages: [
          {
            role: "user",
            content: [
              {
                type: "image",
                source: {
                  type: "base64",
                  media_type: mediaType,
                  data: imageBase64,
                },
              },
              {
                type: "text",
                text: "이 무릎 X-ray의 K&L 등급을 추정하고 지정한 JSON 스키마로만 응답하세요.",
              },
            ],
          },
        ],
      }),
    });

    if (!resp.ok) {
      const mock = buildMock();
      mock.reasoning = `LLM 호출 실패(HTTP ${resp.status}) — 모의 결과로 대체했습니다.`;
      return NextResponse.json(mock);
    }

    const data = await resp.json();
    const text: string =
      data?.content?.find((b: { type: string }) => b.type === "text")?.text ??
      "";

    // 응답에서 JSON 블록 추출
    const match = text.match(/\{[\s\S]*\}/);
    if (!match) {
      const mock = buildMock();
      mock.reasoning = "LLM 응답을 파싱하지 못해 모의 결과로 대체했습니다.";
      return NextResponse.json(mock);
    }

    const parsed = JSON.parse(match[0]);
    const grade = coerceGrade(parsed.kl_grade);

    const result: AnalysisResult = {
      kl_grade: grade,
      stage: STAGE_BY_GRADE[grade],
      confidence:
        parsed.confidence === "high" || parsed.confidence === "medium"
          ? parsed.confidence
          : "low",
      findings: {
        osteophyte: String(parsed.findings?.osteophyte ?? "—"),
        jsn_medial: String(parsed.findings?.jsn_medial ?? "—"),
        jsn_lateral: String(parsed.findings?.jsn_lateral ?? "—"),
        subchondral: String(parsed.findings?.subchondral ?? "—"),
      },
      varus_valgus_impression: String(parsed.varus_valgus_impression ?? "—"),
      reasoning: String(parsed.reasoning ?? "—"),
      limitations:
        "단일 정면 영상 기반 추정입니다. 연골 상태는 X-ray로 직접 평가할 수 없으며, 정렬·교정각 평가에는 전장하지 기립영상이 필요합니다. 본 도구는 연구·교육용입니다.",
      mock: false,
    };

    return NextResponse.json(result);
  } catch {
    const mock = buildMock();
    mock.reasoning = "LLM 호출 중 오류가 발생해 모의 결과로 대체했습니다.";
    return NextResponse.json(mock);
  }
}
