import type { UiMenuItem } from "@/models/ui/UiMenuItem";
import type { SurveyAnswerValue, SurveyChoiceOptionsProps, SurveyNoneChoiceProps } from "headless-survey-engine";

import { SURVEY_NONE_TITLE, SURVEY_OTHER_KEY, SURVEY_OTHER_TITLE } from "@/services/resource/survey/constants";
import { getSurveyChoiceText, getSurveyOrderedChoices, SURVEY_NONE_ANSWER } from "headless-survey-engine";

// What a choice question offers beside its choices: the other option every choice question may add, and the none
// Option a radio group may add. A dropdown has no none option, so its node leaves both out
export type SurveyChoiceOptions = Partial<SurveyNoneChoiceProps> &
  Pick<SurveyChoiceOptionsProps, "choices" | "choicesOrder" | "hasOther" | "otherText">;

// A choice question's answer as one pick among its choices: a choice gives its own value, the none option gives "none"
// And the other option gives the text typed into it. The pick is held apart from the answer, since an empty other text
// Is no answer, and the other option must stay chosen while its text is still empty
export const useSurveyChoiceAnswer = (
  answer: Ref<SurveyAnswerValue | undefined>,
  getOptions: () => SurveyChoiceOptions,
  seed: string,
) => {
  const isOtherChosen = ref(false);
  // A choice's key is its place in the order the reader sees the choices in, so the list and the pick read one order
  const orderedChoices = computed(() => {
    const { choices, choicesOrder } = getOptions();
    return getSurveyOrderedChoices(choices, choicesOrder, seed);
  });
  const selectedKey = computed(() => {
    const { hasNone, hasOther } = getOptions();
    if (isOtherChosen.value) return SURVEY_OTHER_KEY;
    if (answer.value === undefined) return undefined;
    if (hasNone && answer.value === SURVEY_NONE_ANSWER) return SURVEY_NONE_ANSWER;
    const index = orderedChoices.value.findIndex(({ value }) => value === answer.value);
    if (index !== -1) return String(index);
    return hasOther ? SURVEY_OTHER_KEY : undefined;
  });
  // The other text is held as it is typed, and is prefilled only from an answer that is one the other option gave
  const otherText = ref(selectedKey.value === SURVEY_OTHER_KEY && typeof answer.value === "string" ? answer.value : "");
  const otherTitle = computed(() => getOptions().otherText || SURVEY_OTHER_TITLE);
  const items = computed<UiMenuItem<string>[]>(() => {
    const { hasNone, hasOther, noneText } = getOptions();
    return [
      ...orderedChoices.value.map((choice, index) => ({ title: getSurveyChoiceText(choice), value: String(index) })),
      ...(hasOther ? [{ title: otherTitle.value, value: SURVEY_OTHER_KEY }] : []),
      ...(hasNone ? [{ title: noneText || SURVEY_NONE_TITLE, value: SURVEY_NONE_ANSWER }] : []),
    ];
  });
  const pick = (key: string | undefined) => {
    isOtherChosen.value = key === SURVEY_OTHER_KEY;
    if (key === SURVEY_OTHER_KEY) answer.value = otherText.value === "" ? undefined : otherText.value;
    else if (key === SURVEY_NONE_ANSWER) answer.value = SURVEY_NONE_ANSWER;
    else answer.value = orderedChoices.value[Number(key)]?.value;
  };
  const updateOtherText = (value: string) => {
    otherText.value = value;
    answer.value = value === "" ? undefined : value;
  };

  return {
    isOther: computed(() => selectedKey.value === SURVEY_OTHER_KEY),
    items,
    otherText,
    otherTitle,
    pick,
    selectedKey,
    updateOtherText,
  };
};
