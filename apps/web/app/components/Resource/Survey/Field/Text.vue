<script setup lang="ts">
import type { SurveyAnswerValue, SurveyTextNode } from "survey-engine";

import { SURVEY_TEXT_FIELD_TYPES } from "@/services/resource/survey/constants";
import { getSurveyQuestionTitle } from "@/services/resource/survey/getSurveyQuestionTitle";
import { SurveyTextInputType } from "survey-engine";

interface Props {
  // The message the runner gives this question, "" while it has none, drawn beside the field and marking it invalid
  error: string;
  isDisabled: boolean;
  node: SurveyTextNode;
}

const answer = defineModel<SurveyAnswerValue | undefined>({ default: undefined });
const { error, isDisabled, node } = defineProps<Props>();
const isDate = computed(
  () => node.props.inputType === SurveyTextInputType.Date || node.props.inputType === SurveyTextInputType.DatetimeLocal,
);
const isDateTime = computed(() => node.props.inputType === SurveyTextInputType.DatetimeLocal);
const isNumber = computed(() => node.props.inputType === SurveyTextInputType.Number);
// The text the reader has typed is held here while they type, so a number's partial text such as "1." is not rewritten
// By the answer it has not yet become
const text = ref(answer.value === undefined ? "" : String(answer.value));
const toAnswer = (value: string): SurveyAnswerValue | undefined => {
  if (value === "") return undefined;
  return isNumber.value ? Number(value) : value;
};
const updateText = (value: string) => {
  text.value = value;
  answer.value = toAnswer(value);
};
// A date is held as the ISO text of its instant, which the picker reads back as the same moment
const date = computed<Date | undefined>({
  get: () => (typeof answer.value === "string" ? new Date(answer.value) : undefined),
  set: (value) => {
    answer.value = value?.toISOString();
  },
});
</script>

<template>
  <div flex flex-col gap-1>
    <UiDateField
      v-if="isDate"
      v-model="date"
      :is-required="node.props.isRequired || undefined"
      :aria-invalid="error ? true : undefined"
      is-clearable
      :is-disabled="isDisabled || undefined"
      :is-time="isDateTime || undefined"
      :label="getSurveyQuestionTitle(node.props)"
    />
    <UiTextField
      v-else
      :error
      :hint="node.props.description"
      :is-required="node.props.isRequired || undefined"
      :is-disabled="isDisabled || undefined"
      :label="getSurveyQuestionTitle(node.props)"
      :maxlength="node.props.maxLength"
      :model-value="text"
      :placeholder="node.props.placeholder"
      :type="SURVEY_TEXT_FIELD_TYPES[node.props.inputType]"
      @update:model-value="(value) => updateText(value)"
    />
    <template v-if="isDate">
      <span v-if="node.props.description" text-sm text-muted>{{ node.props.description }}</span>
      <span v-if="error" role="alert" text-sm text-error>{{ error }}</span>
    </template>
  </div>
</template>
