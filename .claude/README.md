# 실손보험 지급거절 사례집 시스템 — 실행 안내

Claude Code가 자동 인식하는 위치(`.claude/agents`, `.claude/skills`)에 배치되어 있다.

## 구성
- `agents/` — 7개 서브에이전트 (orchestrator + 6개 전문 에이전트)
- `skills/<name>/SKILL.md` — 6개 스킬

## 실행 방법
1. 프로젝트 루트에서 `claude` 실행
2. `/agents` 로 에이전트 인식 확인
3. orchestrator는 **메인 대화(최상위)** 에서 구동한다. 사례를 자연어로 입력:
   ```
   orchestrator 로 처리해줘:
   "도수치료 9회분이 의료자문상 불필요하다고 부지급됐어요(2세대)"
   ```
4. 흐름: orchestrator → denial-case-researcher → **legitimacy-gate(필수)**
   → (다툼가능일 때만) clause-precedent-analyst → medical-advisory-responder
   + treating-physician-evidence → casebook-card-writer → 최종 카드

## 동작상 유의점
- 각 전문 에이전트는 자기 스킬을 **Skill 도구로 직접 호출**하도록 프롬프트에 명시했고,
  이를 위해 해당 에이전트의 `tools` 에 `Skill` 을 추가했다.
- 서브에이전트는 다른 서브에이전트를 직접 호출할 수 없다. 라우팅은 최상위에서
  orchestrator가 각 단계를 순차 위임하는 구조로 운용한다.

## 면책 고지
본 시스템과 산출물은 일반 정보 제공용 초안이며 법률·보험 자문이 아니다.
실제 진행 전 손해사정사·변호사 등 전문가 확인을 권한다.
