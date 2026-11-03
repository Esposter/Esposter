<script setup lang="ts">
import type { SurveyAnswerValue, SurveyCommentNode } from "survey-engine";

interface Props {
  // The message the runner gives this question, "" while it has none, drawn beside the field and marking it invalid
  error: string;
  isDisabled: boolean;
  node: SurveyCommentNode;
}

const answer = defineModel<SurveyAnswerValue | undefined>();
const { error, isDisabled, node } = defineProps<Props>();
const REQUIRED_HINT = "Required";
const title = computed(() => node.props.title || node.props.name);
const hint = computed(() =>
  node.props.isRequired ? [node.props.description, REQUIRED_HINT].filter(Boolean).join(" ") : node.props.description,
);
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
    :hint
    :is-disabled="isDisabled || undefined"
    :label="title"
    :maxlength="node.props.maxLength"
    :placeholder="node.props.placeholder"
    :rows="node.props.rows"
  />
</template>
