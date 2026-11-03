import type { SurveyAnswerValue } from "survey-engine";
import type { Ref } from "vue";

// A question whose answer is a record from each name to its answer, which reads as the empty record until one is given
export const useSurveyRecordAnswer = (answer: Ref<SurveyAnswerValue | undefined>) =>
  computed<Record<string, SurveyAnswerValue>>(() =>
    typeof answer.value === "object" && !Array.isArray(answer.value) ? answer.value : {},
  );
