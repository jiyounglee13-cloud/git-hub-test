"use client";

import { useState } from "react";

const faqs = [
  {
    question: "CAR-T 세포치료는 어떤 환자가 받을 수 있나요?",
    answer:
      "현재 CAR-T 세포치료는 주로 기존 치료(화학요법, 표적치료, 줄기세포이식 등)에 반응하지 않거나 재발한 특정 혈액암 환자를 대상으로 합니다. 대표적으로 B세포 급성 림프구성 백혈병(ALL), 미만성 거대B세포 림프종(DLBCL), 다발성 골수종(MM) 등이 해당됩니다. 담당 의료진이 환자의 전반적인 건강 상태와 질환 특성을 평가하여 적합성을 판단합니다.",
  },
  {
    question: "치료 비용은 얼마나 드나요?",
    answer:
      "CAR-T 세포치료는 고가의 치료입니다. 해외에서는 제품에 따라 약 3억~5억 원 수준이며, 한국에서는 건강보험 적용 여부에 따라 환자 부담이 달라집니다. 2024년부터 일부 CAR-T 제품이 국내 건강보험 급여 대상에 포함되어 환자 부담이 크게 줄었습니다. 구체적인 비용은 치료기관과 보험 적용 조건에 따라 다르므로, 담당 의료진 및 원무팀과 상담하시기 바랍니다.",
  },
  {
    question: "치료 성공률은 어느 정도인가요?",
    answer:
      "질환 종류와 제품에 따라 다르지만, B세포 ALL에서는 약 70~90%의 완전관해율이 보고되고 있으며, DLBCL에서는 약 40~60%의 장기 관해율이 보고됩니다. 다발성 골수종에서는 BCMA 표적 CAR-T로 약 70~80%의 반응률을 보이고 있습니다. 다만 이는 임상시험 결과이며, 실제 치료 성적은 환자 개인의 상태에 따라 달라질 수 있습니다.",
  },
  {
    question: "치료 후 일상생활은 언제부터 가능한가요?",
    answer:
      "CAR-T 세포 주입 후 최소 2~4주 입원이 필요하며, 퇴원 후에도 약 1~3개월간 치료기관 근처에서 생활하며 정기 검진을 받는 것이 권장됩니다. 면역 회복 상태에 따라 일상 복귀 시기가 달라지며, 보통 치료 후 3~6개월 경과 시 대부분의 일상활동이 가능해집니다. 단, 감염 예방을 위한 주의사항은 장기간 지켜야 합니다.",
  },
  {
    question: "CAR-T 세포치료를 받으면 암이 완치되나요?",
    answer:
      "CAR-T 세포치료로 장기 관해(5년 이상 재발 없음)에 도달하는 환자가 있으며, 이 경우 사실상 완치로 볼 수 있습니다. 그러나 모든 환자에게 해당되는 것은 아니며, 재발하는 경우도 있습니다. 재발의 원인으로는 항원 소실(antigen loss), CAR-T 세포의 소진(exhaustion) 등이 알려져 있습니다. 현재 이를 극복하기 위한 차세대 CAR-T 연구가 활발히 진행 중입니다.",
  },
  {
    question: "한국에서 CAR-T 세포치료를 받을 수 있는 병원은 어디인가요?",
    answer:
      "한국에서는 서울대학교병원, 서울아산병원, 삼성서울병원, 세브란스병원 등 주요 대학병원에서 CAR-T 세포치료를 시행하고 있습니다. CAR-T 치료는 고도의 전문 인력과 시설이 필요하므로, REMS(위험평가 및 완화전략) 인증을 받은 의료기관에서만 시행 가능합니다. 치료 가능 여부는 해당 병원의 혈액종양내과에 문의하시기 바랍니다.",
  },
  {
    question: "고형암(위암, 폐암 등)에도 CAR-T 치료가 가능한가요?",
    answer:
      "현재 승인된 CAR-T 제품은 모두 혈액암을 대상으로 합니다. 고형암에 대한 CAR-T 연구는 활발히 진행되고 있지만, 종양 미세환경의 면역억제, 적절한 표적 항원 부족, T세포의 종양 침투 어려움 등의 도전이 있습니다. HER2, GD2, mesothelin 등을 표적으로 한 고형암 CAR-T 임상시험이 진행 중이며, 향후 적응증 확대가 기대됩니다.",
  },
  {
    question: "CAR-T 세포치료와 줄기세포이식의 차이점은 무엇인가요?",
    answer:
      "줄기세포이식(조혈모세포이식)은 고용량 화학요법 후 정상 조혈을 회복시키기 위해 조혈모세포를 주입하는 치료입니다. 반면 CAR-T 세포치료는 유전자 변형된 면역세포를 주입하여 잔존 암세포를 직접 공격하는 치료입니다. CAR-T는 이식 전처치 수준의 강력한 화학요법이 필요하지 않으며, 이식편대숙주병(GVHD) 위험이 없다는 장점이 있습니다.",
  },
];

function FaqItem({
  question,
  answer,
}: {
  question: string;
  answer: string;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className="border-b border-gray-200 dark:border-gray-800">
      <button
        onClick={() => setOpen(!open)}
        className="flex w-full items-center justify-between py-5 text-left"
      >
        <span className="pr-4 font-medium">{question}</span>
        <span className="shrink-0 text-xl text-gray-400">
          {open ? "−" : "+"}
        </span>
      </button>
      {open && (
        <p className="pb-5 text-sm leading-7 text-gray-600 dark:text-gray-400">
          {answer}
        </p>
      )}
    </div>
  );
}

export default function FaqPage() {
  return (
    <div className="mx-auto max-w-3xl px-6 py-16">
      <h1 className="text-3xl font-bold">자주 묻는 질문 (FAQ)</h1>
      <p className="mt-4 text-lg leading-8 text-gray-600 dark:text-gray-400">
        카티스템(CAR-T 세포치료)에 대해 환자와 보호자분들이 가장 많이
        궁금해하시는 질문들을 모았습니다.
      </p>

      <div className="mt-10">
        {faqs.map((faq) => (
          <FaqItem key={faq.question} {...faq} />
        ))}
      </div>

      <div className="mt-12 rounded-2xl bg-blue-50 p-8 dark:bg-blue-950/20">
        <h3 className="font-semibold text-blue-800 dark:text-blue-300">
          💬 추가 문의
        </h3>
        <p className="mt-2 text-sm leading-6 text-blue-700 dark:text-blue-400">
          위 내용에서 답변을 찾지 못하셨다면, 담당 의료진 또는 치료기관의
          혈액종양내과에 직접 문의하시기 바랍니다. 본 사이트의 정보는 일반적인
          안내 목적이며, 개별 환자의 치료 결정을 대신할 수 없습니다.
        </p>
      </div>
    </div>
  );
}
