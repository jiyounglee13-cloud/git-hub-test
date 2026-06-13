# Knee OA & HTO Assistant (독립형 데모)

무릎 X-ray의 **K&L 등급 판독**과 **HTO 교정각·정렬 분석**을 한 화면에서 제공하는 독립 실행형 연구·교육용 데모입니다. 판독(정성)은 LLM, 계측(정량)은 결정론적 기하로 분리되어 있습니다.

> ⚠ **진단·치료 목적 사용 불가.** K&L 등급은 LLM 비전 추정(재현성 비보장), 교정각은 랜드마크 기반 기하 계산, Before/After는 시뮬레이션입니다.

![데모 화면](docs/screenshot-xray-demo.png)

## 실행

```bash
npm install
npm run dev      # http://localhost:3000
# 또는
npm run build && npm start
```

## 기능
- **K&L 0~4 등급** + 소견(골극·관절간격·연골하골) + 영상 적합성 평가 (LLM 비전, `temperature 0` + 다중표본 다수결)
- **HTO 계측**: WBL%, Miniaci 교정각, 개대 쐐기 + **HKA·MPTA(전/후)·JLCA·mLDFA** 정렬 분석
- **측면상 후방 경골 경사** 자동 계측(랜드마크 4점)
- **Before/After** 경첩 회전 시뮬레이션 + 연골 상태별 시나리오(의사 선택용)
- **안전 경고**: MPTA>95°, 교정각>12°, JLCA>4°, mLDFA 이상, K&L4 HTO 금기, 랜드마크 오배치
- **입력**: JPG/PNG 또는 비압축 DICOM(.dcm), 랜드마크 드래그 미세조정

## 2단계 전략 (백엔드 추상화)
판독 엔진은 `KLGrader` 인터페이스(`src/lib/grader.ts`) 뒤에 있어, 데모용 **LLM 백엔드**를 임상용 **CNN 백엔드**로 *API/UI 수정 없이* 교체할 수 있습니다(`KL_BACKEND`).

## 환경 변수 (선택)

| 변수 | 설명 |
| --- | --- |
| `ANTHROPIC_API_KEY` | 설정 시 Claude 비전으로 실제 추론. **미설정 시 결정론적 모의(mock) 결과로 폴백**하여 데모는 항상 동작. |
| `ANTHROPIC_MODEL` | 비전 모델 (기본값 `claude-sonnet-4-6`). |
| `KL_BACKEND` | 판독 백엔드: `llm`(기본) 또는 `cnn`(미구현 스텁). |
| `KL_SAMPLES` | LLM 다중표본 수(1~5, 기본 1). 2 이상이면 다수결 + 표본 일치율로 재현성 보강. |

## 구조
```
src/
  app/
    layout.tsx          독립형 레이아웃(자체 헤더/푸터)
    page.tsx            메인 화면(안전 배너 + 도구)
    KneeTool.tsx        인터랙티브 캔버스 도구(클라이언트)
    api/analyze/route.ts  K&L 판독 엔드포인트(키 없으면 모의 폴백)
  lib/
    hto.ts              HTO 기하(Fujisawa·Miniaci·정렬각·안전경고)
    grader.ts           판독 백엔드 추상화(LLM/CNN)
    dicom.ts            DICOM → PNG 렌더(비압축)
```

- 임상 검증 로드맵: [`CLINICAL_VALIDATION_ROADMAP.md`](CLINICAL_VALIDATION_ROADMAP.md)
- 샘플 X-ray(합성): `public/sample-knee-xray.png`
