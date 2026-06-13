// K&L 등급 판독 백엔드 추상화 (2단계 전략)
//
// 핵심: 판독 엔진을 인터페이스 뒤에 두어, 데모용 LLM 추론을 임상용 전용 CNN으로
// "인터페이스 변경 없이" 교체할 수 있게 한다. (KL_BACKEND 환경변수로 선택)
//
//   Phase 0 (데모)  : LLMGrader  — Claude 비전, 학습 불필요, 재현성은 보강 대상
//   Phase 2 (임상)  : CNNGrader  — 자체 학습 모델 (여기서는 미구현 스텁)
//
// API 라우트는 getGrader() 만 호출하면 되고, 백엔드 종류를 알 필요가 없다.

export type Confidence = "low" | "medium" | "high";

export interface GradeInput {
  imageBase64: string;
  mediaType: string;
  /** 좌/우 무릎 (정렬 해석·라벨용) */
  laterality?: "left" | "right" | "unknown";
  /** 촬영 자세 (적합성 판단용) */
  view?: "ap_weightbearing" | "ap_supine" | "lateral" | "rosenberg" | "unknown";
}

export interface GradeResult {
  kl_grade: number;
  stage: string;
  confidence: Confidence;
  findings: {
    osteophyte: string;
    jsn_medial: string;
    jsn_lateral: string;
    subchondral: string;
  };
  varus_valgus_impression: string;
  reasoning: string;
  limitations: string;
  /** 영상 적합성 (체중부하 AP 여부 등). 부적합 시 등급 신뢰도 하향. */
  view_adequacy: string;
  /** 사용된 백엔드 식별자 */
  backend: string;
  /** 재현성 지표: 다중표본 다수결 시 일치율(0~1), 단일표본이면 null */
  agreement: number | null;
  mock: boolean;
}

export interface KLGrader {
  readonly id: string;
  grade(input: GradeInput): Promise<GradeResult>;
}

const STAGE_BY_GRADE: Record<number, string> = {
  0: "정상",
  1: "의심 (초기 이전)",
  2: "초기",
  3: "중기",
  4: "말기",
};

function coerceGrade(v: unknown): number {
  const n = Math.round(Number(v));
  if (Number.isNaN(n)) return 2;
  return Math.min(4, Math.max(0, n));
}

const SYSTEM_PROMPT = `당신은 근골격계 영상 판독을 보조하는 도구입니다. 제공된 무릎 X-ray를 보고 Kellgren-Lawrence(K&L) 등급(0~4)을 추정하세요.

먼저 영상 적합성을 평가하세요. K&L 등급은 '체중부하 정면(AP weight-bearing)' 영상이 표준입니다. 측면상·비체중부하·부적절 조사야이면 등급 신뢰도를 낮추고 view_adequacy에 그 사유를 적으세요.

평가 기준:
- 골극(osteophyte) 형성 여부와 위치
- 관절간격 협착(joint space narrowing) — 내측/외측 구획 별도
- 연골하골 경화(subchondral sclerosis)
- 전반적 내반/외반 정렬 인상

반드시 아래 JSON 스키마로만 응답하세요. 다른 텍스트 없이 JSON만 출력합니다:
{
  "kl_grade": <0~4 정수>,
  "confidence": "<low|medium|high>",
  "view_adequacy": "<영상 적합성 한국어 평가>",
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

const LIMITATIONS =
  "단일 정면 영상 기반 추정입니다. 연골 상태는 X-ray로 직접 평가할 수 없으며, 정렬·교정각 평가에는 전장하지 기립영상이 필요합니다. 본 도구는 연구·교육용입니다.";

function buildMock(reason?: string): GradeResult {
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
      reason ??
      "내측 관절간격 협착과 경미한 골극 소견으로 K&L 2등급(초기)에 부합. (※ 모의 추론 결과입니다.)",
    limitations: LIMITATIONS,
    view_adequacy: "모의 결과 — 적합성 미평가",
    backend: "mock",
    agreement: null,
    mock: true,
  };
}

// ---------- LLM 백엔드 (Phase 0) ----------
class LLMGrader implements KLGrader {
  readonly id = "llm";

  private async sample(
    input: GradeInput,
    apiKey: string,
    model: string
  ): Promise<Record<string, unknown> | null> {
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
        // 재현성: temperature 0 으로 표본 간 변동 최소화
        temperature: 0,
        system: SYSTEM_PROMPT,
        messages: [
          {
            role: "user",
            content: [
              {
                type: "image",
                source: {
                  type: "base64",
                  media_type: input.mediaType,
                  data: input.imageBase64,
                },
              },
              {
                type: "text",
                text: `무릎: ${input.laterality ?? "unknown"}, 촬영자세: ${
                  input.view ?? "unknown"
                }. 이 무릎 X-ray의 K&L 등급을 추정하고 지정한 JSON 스키마로만 응답하세요.`,
              },
            ],
          },
        ],
      }),
    });
    if (!resp.ok) return null;
    const data = await resp.json();
    const text: string =
      data?.content?.find((b: { type: string }) => b.type === "text")?.text ??
      "";
    const match = text.match(/\{[\s\S]*\}/);
    if (!match) return null;
    try {
      return JSON.parse(match[0]);
    } catch {
      return null;
    }
  }

  async grade(input: GradeInput): Promise<GradeResult> {
    const apiKey = process.env.ANTHROPIC_API_KEY;
    const model = process.env.ANTHROPIC_MODEL || "claude-sonnet-4-6";
    if (!apiKey) return buildMock("API 키 미설정 — 모의 추론 결과입니다.");

    // 재현성 보강: KL_SAMPLES 만큼 표본을 모아 다수결 + 일치율 산출
    const n = Math.max(1, Math.min(5, Number(process.env.KL_SAMPLES) || 1));
    const samples: Record<string, unknown>[] = [];
    try {
      for (let i = 0; i < n; i++) {
        const s = await this.sample(input, apiKey, model);
        if (s) samples.push(s);
      }
    } catch {
      return buildMock("LLM 호출 중 오류 — 모의 결과로 대체했습니다.");
    }
    if (samples.length === 0)
      return buildMock("LLM 응답 파싱 실패 — 모의 결과로 대체했습니다.");

    // 다수결 등급 + 일치율
    const grades = samples.map((s) => coerceGrade(s.kl_grade));
    const counts = new Map<number, number>();
    for (const g of grades) counts.set(g, (counts.get(g) ?? 0) + 1);
    let modeGrade = grades[0];
    let modeCount = 0;
    for (const [g, c] of counts) {
      if (c > modeCount) {
        modeGrade = g;
        modeCount = c;
      }
    }
    const agreement = n > 1 ? modeCount / samples.length : null;
    const rep = samples.find((s) => coerceGrade(s.kl_grade) === modeGrade)!;

    const f = (rep.findings ?? {}) as Record<string, unknown>;
    return {
      kl_grade: modeGrade,
      stage: STAGE_BY_GRADE[modeGrade],
      confidence:
        rep.confidence === "high" || rep.confidence === "medium"
          ? (rep.confidence as Confidence)
          : "low",
      findings: {
        osteophyte: String(f.osteophyte ?? "—"),
        jsn_medial: String(f.jsn_medial ?? "—"),
        jsn_lateral: String(f.jsn_lateral ?? "—"),
        subchondral: String(f.subchondral ?? "—"),
      },
      varus_valgus_impression: String(rep.varus_valgus_impression ?? "—"),
      reasoning: String(rep.reasoning ?? "—"),
      view_adequacy: String(rep.view_adequacy ?? "—"),
      limitations: LIMITATIONS,
      backend: n > 1 ? `llm×${samples.length} (다수결)` : "llm",
      agreement,
      mock: false,
    };
  }
}

// ---------- CNN 백엔드 (Phase 2, 미구현 스텁) ----------
// 임상 정확도가 필요해지면 이 클래스를 자체 학습 모델 추론으로 구현한다.
// 인터페이스(KLGrader)가 동일하므로 API 라우트·프런트엔드 수정이 불필요하다.
class CNNGrader implements KLGrader {
  readonly id = "cnn";
  async grade(): Promise<GradeResult> {
    const m = buildMock(
      "전용 CNN 백엔드는 아직 미구현입니다(Phase 2). KL_BACKEND=llm 로 데모를 사용하세요."
    );
    m.backend = "cnn(미구현)";
    return m;
  }
}

let cached: KLGrader | null = null;
export function getGrader(): KLGrader {
  if (cached) return cached;
  const backend = (process.env.KL_BACKEND || "llm").toLowerCase();
  cached = backend === "cnn" ? new CNNGrader() : new LLMGrader();
  return cached;
}
