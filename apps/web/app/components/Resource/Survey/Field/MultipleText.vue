<script setup lang="ts">
import type { SurveyAnswerValue, SurveyMultipleTextItem, SurveyMultipleTextNode } from "survey-engine";

import { UiTextFieldType } from "@/models/ui/UiTextFieldType";
import { SurveyMultipleTextItemInputType } from "survey-engine";

interface Props {
  // The message the runner gives the question when it fails a check, "" when it has none
  error: string;
  isDisabled: boolean;
  node: SurveyMultipleTextNode;
}

const answer = defineModel<SurveyAnswerValue | undefined>();
const { error, isDisabled, node } = defineProps<Props>();
const id = useId();
const label = computed(() => node.props.title || node.props.name);
const descriptionId = `${id}-description`;
const errorId = `${id}-error`;
// The answer is a record from each item's name to its text, read as the empty record until one is given
const answers = computed<Record<string, SurveyAnswerValue>>(() =>
  typeof answer.value === "object" && !Array.isArray(answer.value) ? answer.value : {},
);
const describedBy = computed(
  () => [node.props.description && descriptionId, error && errorId].filter(Boolean).join(" ") || undefined,
);
const getText = (value: SurveyAnswerValue | undefined) => (typeof value === "string" ? value : "");
// An email is drawn as a text field, since the library's text field takes no email type
const getTextFieldType = ({ inputType }: SurveyMultipleTextItem) =>
  inputType === SurveyMultipleTextItemInputType.Number ? UiTextFieldType.Number : undefined;
const updateItem = (name: string, text: string) => {
  answer.value = { ...answers.value, [name]: text };
};
</script>

<template>
  <div
    role="group"
    :aria-describedby="describedBy"
    :aria-invalid="error ? true : undefined"
    :aria-label="label"
    flex
    flex-col
    gap-2
  >
    <span text-sm text-muted
      >{{ label }}<span v-if="node.props.isRequired" aria-hidden="true" text-error> *</span></span
    >
    <span v-if="node.props.description" :id="descriptionId" text-sm text-muted>{{ node.props.description }}</span>
    <UiTextField
      v-for="item of node.props.items"
      :key="item.name"
      :is-disabled="isDisabled || undefined"
      :label="item.title || item.name"
      :model-value="getText(answers[item.name])"
      :type="getTextFieldType(item)"
      @update:model-value="(text) => updateItem(item.name, text)"
    />
    <span v-if="error" :id="errorId" role="alert" text-sm text-error>{{ error }}</span>
  </div>
</template>
