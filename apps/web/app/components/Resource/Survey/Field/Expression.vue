<script setup lang="ts">
import type { SurveyAnswerValue, SurveyExpressionNode } from "headless-survey-engine";

import { SurveyExpressionDisplayFormat } from "headless-survey-engine";

interface Props {
  error: string;
  isDisabled: boolean;
  node: SurveyExpressionNode;
}

// The calculated value is the answer the runner gives it, which the reader only reads, so the model is never written
const answer = defineModel<SurveyAnswerValue | undefined>({ default: undefined });
const { node } = defineProps<Props>();
// An absent value reads as the empty string, and a number is shown in the format its owner chose, to the places it keeps
const text = computed(() => {
  const { displayFormat, maxFractionDigits } = node.props;
  if (answer.value === undefined) return "";
  if (typeof answer.value !== "number" || displayFormat === SurveyExpressionDisplayFormat.None)
    return String(answer.value);

  return new Intl.NumberFormat(undefined, {
    maximumFractionDigits: maxFractionDigits,
    style: displayFormat === SurveyExpressionDisplayFormat.Percent ? "percent" : "decimal",
  }).format(answer.value);
});
</script>

<template>
  <div flex flex-col gap-1>
    <span text-sm text-muted>{{ node.props.title || node.props.name }}</span>
    <output :aria-label="node.props.title || node.props.name">{{ text }}</output>
    <span v-if="node.props.description" text-sm text-muted>{{ node.props.description }}</span>
  </div>
</template>
