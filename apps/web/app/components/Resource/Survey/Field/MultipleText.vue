<script setup lang="ts">
import type { SurveyAnswerValue, SurveyMultipleTextNode } from "headless-survey-engine";

import { SURVEY_TEXT_FIELD_TYPES } from "@/services/resource/survey/constants";
import { getSurveyAnswerText } from "@/services/resource/survey/getSurveyAnswerText";

interface Props {
  // The message the runner gives the question when it fails a check, "" when it has none
  error: string;
  isDisabled: boolean;
  node: SurveyMultipleTextNode;
}

const answer = defineModel<SurveyAnswerValue | undefined>({ default: undefined });
const { error, isDisabled, node } = defineProps<Props>();
// The answer is a record from each item's name to its text, read as the empty record until one is given
const answers = useSurveyRecordAnswer(answer);
const updateItem = (name: string, text: string) => {
  answer.value = { ...answers.value, [name]: text };
};
</script>

<template>
  <ResourceSurveyFieldShell :error :question="node.props">
    <template #default="{ describedBy, labelledBy }">
      <div role="group" :aria-describedby="describedBy" :aria-labelledby="labelledBy" flex flex-col gap-2>
        <UiTextField
          v-for="item of node.props.items"
          :key="item.name"
          :is-disabled="isDisabled || undefined"
          :is-invalid="error ? true : undefined"
          :is-required="item.isRequired || undefined"
          :label="item.title || item.name"
          :model-value="getSurveyAnswerText(answers[item.name])"
          :type="SURVEY_TEXT_FIELD_TYPES[item.inputType]"
          @update:model-value="(text) => updateItem(item.name, text)"
        />
      </div>
    </template>
  </ResourceSurveyFieldShell>
</template>
