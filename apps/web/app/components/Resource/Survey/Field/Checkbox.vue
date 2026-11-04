<script setup lang="ts">
import type { SurveyAnswerValue, SurveyCheckboxNode } from "survey-engine";

import { getSurveyChoiceText, getSurveyOrderedChoices, SURVEY_NONE_ANSWER } from "survey-engine";

interface Props {
  error: string;
  isDisabled: boolean;
  node: SurveyCheckboxNode;
  // What the shuffled choices are ordered by, the session's seed, so a respondent sees one order throughout
  seed: string;
}
// The answer is one list: the values of the choices picked, none's own value on its own, and the typed other text, which
// Is the one entry that is neither a choice's value nor none, so other needs no second key
const answer = defineModel<SurveyAnswerValue | undefined>({ default: undefined });
const { error, isDisabled, node, seed } = defineProps<Props>();
// The options in the order the reader sees them, which the list draws and a pick is read against
const orderedChoices = computed(() => getSurveyOrderedChoices(node.props.choices, node.props.choicesOrder, seed));
const choiceValues = computed(() => node.props.choices.map(({ value }) => value));
const checkIsOtherEntry = (entry: SurveyAnswerValue): entry is string =>
  typeof entry === "string" && entry !== SURVEY_NONE_ANSWER && !choiceValues.value.includes(entry);
// The picks, none and the other text are held here as the reader makes them. The answer holds other text as itself, so
// A text equal to a choice's value cannot be read back from it: it would tick that choice and hide the other field
const { initial, isOtherChosen, otherText, pickedValues } = useSurveyPickedAnswer(
  answer,
  choiceValues.value,
  node.props.hasOther,
  checkIsOtherEntry,
);
const isNoneChosen = ref(initial.includes(SURVEY_NONE_ANSWER));
const checkIsChosen = (value: number | string) => pickedValues.value.includes(value);
const isAllChosen = computed(
  () => choiceValues.value.length > 0 && choiceValues.value.every((value) => checkIsChosen(value)),
);
const isSomeChosen = computed(() => choiceValues.value.some((value) => checkIsChosen(value)));
const emitAnswer = () => {
  answer.value = isNoneChosen.value
    ? [SURVEY_NONE_ANSWER]
    : [...pickedValues.value, ...(isOtherChosen.value ? [otherText.value] : [])];
};
// None is exclusive, so picking any other option gives it up, and the other text is kept through every pick
const toggleChoice = (value: number | string, isPicked: boolean) => {
  isNoneChosen.value = false;
  pickedValues.value = [...pickedValues.value.filter((entry) => entry !== value), ...(isPicked ? [value] : [])];
  emitAnswer();
};
const toggleAll = (isPicked: boolean) => {
  isNoneChosen.value = false;
  pickedValues.value = isPicked ? [...choiceValues.value] : [];
  emitAnswer();
};
const toggleNone = (isPicked: boolean) => {
  isNoneChosen.value = isPicked;
  pickedValues.value = [];
  isOtherChosen.value = false;
  emitAnswer();
};
const toggleOther = (isPicked: boolean) => {
  isNoneChosen.value = false;
  if (isPicked) otherText.value = "";
  isOtherChosen.value = isPicked;
  emitAnswer();
};
const setOtherText = (text: string) => {
  otherText.value = text;
  emitAnswer();
};
</script>

<template>
  <ResourceSurveyFieldShell :error :question="node.props">
    <template #default="{ describedBy, labelledBy }">
      <div :aria-describedby="describedBy" :aria-labelledby="labelledBy" role="group" flex flex-col gap-2>
        <UiCheckbox
          v-if="node.props.hasSelectAll && choiceValues.length > 0"
          is-label-shown
          :aria-invalid="error ? true : undefined"
          :disabled="isDisabled"
          :is-mixed="isSomeChosen && !isAllChosen ? true : undefined"
          :label="node.props.selectAllText || 'Select all'"
          :model-value="isAllChosen"
          @update:model-value="(isPicked) => toggleAll(isPicked)"
        />
        <UiCheckbox
          v-for="choice of orderedChoices"
          :key="choice.value"
          is-label-shown
          :aria-invalid="error ? true : undefined"
          :disabled="isDisabled"
          :label="getSurveyChoiceText(choice)"
          :model-value="checkIsChosen(choice.value)"
          @update:model-value="(isPicked: boolean) => toggleChoice(choice.value, isPicked)"
        />
        <UiCheckbox
          v-if="node.props.hasNone"
          is-label-shown
          :aria-invalid="error ? true : undefined"
          :disabled="isDisabled"
          :label="node.props.noneText || 'None'"
          :model-value="isNoneChosen"
          @update:model-value="(isPicked) => toggleNone(isPicked)"
        />
        <template v-if="node.props.hasOther">
          <UiCheckbox
            is-label-shown
            :aria-invalid="error ? true : undefined"
            :disabled="isDisabled"
            :label="node.props.otherText || 'Other'"
            :model-value="isOtherChosen"
            @update:model-value="(isPicked) => toggleOther(isPicked)"
          />
          <UiTextField
            v-if="isOtherChosen"
            :is-disabled="isDisabled ? true : undefined"
            is-label-hidden
            :label="node.props.otherText || 'Other'"
            :model-value="otherText"
            @update:model-value="(text) => setOtherText(text)"
          />
        </template>
      </div>
    </template>
  </ResourceSurveyFieldShell>
</template>
