import type { SurveyAnswerValue, SurveyChoice } from "headless-survey-engine";

// The picks a multiple-pick question starts from, read back from its answer: the answer list itself, the choice values
// It holds, and the other entry, the one that is neither a choice's value nor a special answer, which says whether other
// Starts chosen and what its text starts as. The predicate is the question's own, since what counts as an other entry
// Differs between questions
export const useSurveyPickedAnswer = (
  answer: Ref<SurveyAnswerValue | undefined>,
  choiceValues: SurveyChoice["value"][],
  hasOther: boolean,
  checkIsOtherEntry: (entry: SurveyAnswerValue) => entry is string,
) => {
  const initial = Array.isArray(answer.value) ? answer.value : [];
  const otherEntry = initial.find((entry): entry is string => checkIsOtherEntry(entry));

  return {
    initial,
    isOtherChosen: ref(hasOther && otherEntry !== undefined),
    otherText: ref(otherEntry ?? ""),
    pickedValues: ref(choiceValues.filter((value) => initial.includes(value))),
  };
};
