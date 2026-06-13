This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## 무릎 OA & HTO 보조 도구 (데모) — `/xray`

무릎 X-ray의 K&L 등급을 추정하고 HTO 교정각을 계산하는 **연구·교육용 데모**입니다.

- **K&L 판독 (정성)**: Claude 비전으로 K&L 0~4 등급과 소견(골극·관절간격·연골하골)을 추정합니다. 학습된 모델이 아니라 LLM 추론형이며, 재현성은 보장되지 않습니다.
- **HTO 교정각 (정량)**: 사용자가 영상 위에 찍은 5개 랜드마크(대퇴골두·내측/외측 평탄부·족관절·경첩)로 Miniaci 변형 교정각과 개대 쐐기 높이를 **결정론적 기하 계산**(`src/lib/hto.ts`)으로 산출합니다.
- **Before/After**: 경첩 중심 회전 기하 시뮬레이션. 실제 수술 결과 예측이 아닙니다.
- **시나리오 카드**: 연골 상태별(양호/표준/보수적) 목표 WBL% 옵션 — AI 자동판단이 아닌 의사 선택용.

### 환경 변수 (선택)

| 변수 | 설명 |
| --- | --- |
| `ANTHROPIC_API_KEY` | 설정 시 Claude 비전으로 실제 추론. **미설정 시 결정론적 모의(mock) 결과로 폴백**하여 데모는 항상 동작합니다. |
| `ANTHROPIC_MODEL` | 사용할 비전 모델 (기본값 `claude-sonnet-4-6`). |

> ⚠ 본 도구는 진단·치료 목적으로 사용할 수 없습니다. 연골 상태는 X-ray로 직접 평가할 수 없으며, 정렬·교정각 평가에는 전장하지 기립영상이 필요합니다.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
