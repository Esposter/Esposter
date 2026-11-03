<script setup lang="ts">
import type { SurveyAnswerValue, SurveyTextNode } from "survey-engine";

import { UiTextFieldType } from "@/models/ui/UiTextFieldType";
import { getSurveyFieldHint } from "@/services/survey/getSurveyFieldHint";
import { SurveyTextInputType } from "survey-engine";

interface Props {
  // The message the runner gives this question, "" while it has none, drawn beside the field and marking it invalid
  error: string;
  isDisabled: boolean;
  node: SurveyTextNode;
}

const answer = defineModel<SurveyAnswerValue | undefined>({ default: undefined });
const { error, isDisabled, node } = defineProps<Props>();
// The input types the library's text field draws as its own control; the rest are typed as plain text
const TEXT_FIELD_TYPES: Partial<Record<SurveyTextInputType, UiTextFieldType>> = {
  [SurveyTextInputType.Number]: UiTextFieldType.Number,
  [SurveyTextInputType.Password]: UiTextFieldType.Password,
  [SurveyTextInputType.Time]: UiTextFieldType.Time,
};
const title = computed(() => node.props.title || node.props.name);
const hint = computed(() => getSurveyFieldHint(node.props.description, node.props.isRequired));
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
      is-clearable
      :is-disabled="isDisabled || undefined"
      :is-time="isDateTime || undefined"
      :label="title"
    />
    <UiTextField
      v-else
      :error
      :hint
      :is-disabled="isDisabled || undefined"
      :label="title"
      :maxlength="node.props.maxLength"
      :model-value="text"
      :placeholder="node.props.placeholder"
      :type="TEXT_FIELD_TYPES[node.props.inputType]"
      @update:model-value="updateText"
    />
    <template v-if="isDate">
      <span v-if="hint" text-sm text-muted>{{ hint }}</span>
      <span v-if="error" role="alert" text-sm text-error>{{ error }}</span>
    </template>
  </div>
</template>
