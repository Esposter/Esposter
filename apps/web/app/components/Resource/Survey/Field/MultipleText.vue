<script setup lang="ts">
import type { SurveyAnswerValue, SurveyMultipleTextNode } from "survey-engine";

import { SURVEY_TEXT_FIELD_TYPES } from "@/services/resource/survey/constants";

interface Props {
  // The message the runner gives the question when it fails a check, "" when it has none
  error: string;
  isDisabled: boolean;
  node: SurveyMultipleTextNode;
}

const answer = defineModel<SurveyAnswerValue | undefined>({ default: undefined });
const { error, isDisabled, node } = defineProps<Props>();
const label = computed(() => node.props.title || node.props.name);
// The answer is a record from each item's name to its text, read as the empty record until one is given
const answers = useSurveyRecordAnswer(answer);
const getText = (value: SurveyAnswerValue | undefined) => (typeof value === "string" ? value : "");
const updateItem = (name: string, text: string) => {
  answer.value = { ...answers.value, [name]: text };
};
</script>

<template>
  <ResourceSurveyFieldShell
    :description="node.props.description"
    :error
    :is-required="node.props.isRequired"
    :title="label"
  >
    <template #default="{ describedBy }">
      <div role="group" :aria-describedby="describedBy" :aria-label="label" flex flex-col gap-2>
        <UiTextField
          v-for="item of node.props.items"
          :key="item.name"
          :is-disabled="isDisabled || undefined"
          :is-invalid="error ? true : undefined"
          :is-required="node.props.isRequired || undefined"
          :label="item.title || item.name"
          :model-value="getText(answers[item.name])"
          :type="SURVEY_TEXT_FIELD_TYPES[item.inputType]"
          @update:model-value="(text) => updateItem(item.name, text)"
        />
      </div>
    </template>
  </ResourceSurveyFieldShell>
</template>
