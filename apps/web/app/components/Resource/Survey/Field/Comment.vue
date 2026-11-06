<script setup lang="ts">
import type { SurveyAnswerValue, SurveyCommentNode } from "vue-survey-engine-headless";

import { getSurveyQuestionTitle } from "@/services/resource/survey/getSurveyQuestionTitle";

interface Props {
  // The message the runner gives this question, "" while it has none, drawn beside the field and marking it invalid
  error: string;
  isDisabled: boolean;
  node: SurveyCommentNode;
}

const answer = defineModel<SurveyAnswerValue | undefined>({ default: undefined });
const { error, isDisabled, node } = defineProps<Props>();
// A comment's answer is the text as typed, and an empty box holds no answer
const comment = computed({
  get: () => (answer.value === undefined ? "" : String(answer.value)),
  set: (value) => {
    answer.value = value === "" ? undefined : value;
  },
});
</script>

<template>
  <UiTextField
    v-model="comment"
    :error
    :hint="node.props.description"
    :is-required="node.props.isRequired || undefined"
    :is-disabled="isDisabled || undefined"
    :label="getSurveyQuestionTitle(node.props)"
    :maxlength="node.props.maxLength"
    :placeholder="node.props.placeholder"
    :rows="node.props.rows"
  />
</template>
