import { NextRequest, NextResponse } from "next/server";
import { getGrader, type GradeInput } from "@/lib/grader";

// 무릎 X-ray K&L 판독 엔드포인트.
//
// 판독 백엔드(LLM/CNN)는 grader.ts 의 추상화 뒤에 있으며, 이 라우트는
// getGrader() 만 호출한다. 백엔드 교체 시 이 파일은 수정이 불필요하다.

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  let input: GradeInput;
  try {
    const body = await req.json();
    if (!body.imageBase64) {
      return NextResponse.json({ error: "이미지가 없습니다" }, { status: 400 });
    }
    input = {
      imageBase64: body.imageBase64,
      mediaType:
        typeof body.mediaType === "string" ? body.mediaType : "image/jpeg",
      laterality: body.laterality,
      view: body.view,
    };
  } catch {
    return NextResponse.json({ error: "잘못된 요청 본문" }, { status: 400 });
  }

  const result = await getGrader().grade(input);
  return NextResponse.json(result);
}
