"use client";

import { useState } from "react";

const faqs = [
  {
    question: "카티스템은 어떤 환자가 받을 수 있나요?",
    answer:
      "카티스템은 퇴행성 관절염(골관절염) 또는 반복적 외상으로 인한 무릎 관절 연골 결손(ICRS Grade IV) 환자에게 적용됩니다. 기존 보존적 치료(약물치료, 물리치료, 주사치료 등)에 충분히 반응하지 않는 환자가 대상이며, 담당 정형외과 전문의가 MRI 및 임상 소견을 종합하여 적합성을 판단합니다.",
  },
  {
    question: "치료 비용은 얼마나 드나요?",
    answer:
      "카티스템은 한국에서 건강보험 급여 적용이 가능하며, 급여 적용 시 환자 본인부담금이 크게 줄어듭니다. 비급여 시 수백만 원 수준의 비용이 발생할 수 있습니다. 정확한 비용은 환자의 보험 적용 여부, 치료기관, 추가 시술 등에 따라 달라지므로 해당 병원 원무팀에 문의하시기 바랍니다.",
  },
  {
    question: "연골이 실제로 재생되나요? 효과는 얼마나 지속되나요?",
    answer:
      "임상시험 결과, 카티스템 투여 후 MRI 및 관절경 검사에서 히알린 유사 연골(hyaline-like cartilage)의 재생이 확인되었습니다. 투여 후 약 48주(약 1년) 시점에서 유의미한 연골 재생과 통증 감소가 관찰되었으며, 장기 추적 연구에서 7년 이상 치료 효과가 유지되는 것으로 보고되고 있습니다.",
  },
  {
    question: "수술 후 일상생활은 언제부터 가능한가요?",
    answer:
      "수술 후 약 3~7일간 입원하며, 퇴원 후 약 6주간은 목발 보행과 보조기 착용이 필요합니다. 6~12주 차에 걸쳐 점진적으로 체중 부하를 늘리며, 일반적인 일상생활은 약 3개월 후부터 가능해집니다. 달리기, 등산 등 고강도 활동은 약 6개월~1년 후 담당 의사와 상담 후 복귀할 수 있습니다.",
  },
  {
    question: "카티스템은 자기 세포를 사용하나요?",
    answer:
      "아닙니다. 카티스템은 동종(allogeneic) 줄기세포 치료제로, 기증받은 제대혈(탯줄 혈액)에서 분리한 중간엽줄기세포를 사용합니다. 자기 세포를 채취할 필요가 없어 추가 수술이나 공여부 손상이 없으며, 중간엽줄기세포의 면역조절 특성으로 면역거부반응이 매우 낮습니다.",
  },
  {
    question: "무릎 외에 다른 관절에도 사용할 수 있나요?",
    answer:
      "현재 카티스템의 허가된 적응증은 무릎 관절 연골 결손에 한정됩니다. 어깨, 고관절, 발목 등 다른 관절에 대한 적용은 아직 허가되지 않았습니다. 다만, 다른 관절에 대한 연구가 진행 중이며, 향후 적응증이 확대될 가능성이 있습니다.",
  },
  {
    question: "카티스템과 PRP(자가혈소판풍부혈장) 주사의 차이는 무엇인가요?",
    answer:
      "PRP 주사는 환자 자신의 혈액에서 혈소판을 농축하여 주입하는 시술로, 성장인자를 통해 조직 치유를 촉진합니다. 반면 카티스템은 줄기세포를 직접 투여하여 손상된 연골을 재생합니다. PRP는 비교적 간단한 주사 시술이지만 연골 재생 효과는 제한적이며, 카티스템은 관절경 수술이 필요하지만 실제 연골 재생이 확인된 치료제입니다.",
  },
  {
    question: "카티스템 치료를 받을 수 있는 병원은 어디인가요?",
    answer:
      "카티스템은 전국 주요 대학병원 및 정형외과 전문 병원에서 시행하고 있습니다. 서울대학교병원, 삼성서울병원, 서울아산병원, 세브란스병원 등 대형 병원뿐 아니라, 관절 전문 병원에서도 시술이 가능합니다. 카티스템 투여 자격을 갖춘 의료기관은 메디포스트 또는 해당 병원의 정형외과에 문의하시면 확인할 수 있습니다.",
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
        카티스템(CARTSTEM) 치료에 대해 환자와 보호자분들이 가장 많이
        궁금해하시는 질문들을 모았습니다.
      </p>

      <div className="mt-10">
        {faqs.map((faq) => (
          <FaqItem key={faq.question} {...faq} />
        ))}
      </div>

      <div className="mt-12 rounded-2xl bg-teal-50 p-8 dark:bg-teal-950/20">
        <h3 className="font-semibold text-teal-800 dark:text-teal-300">
          💬 추가 문의
        </h3>
        <p className="mt-2 text-sm leading-6 text-teal-700 dark:text-teal-400">
          위 내용에서 답변을 찾지 못하셨다면, 담당 정형외과 전문의 또는
          메디포스트 고객센터에 문의하시기 바랍니다. 본 사이트의 정보는 일반적인
          안내 목적이며, 개별 환자의 치료 결정을 대신할 수 없습니다.
        </p>
      </div>
    </div>
  );
}
