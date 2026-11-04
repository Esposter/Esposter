<script setup lang="ts">
import type { SurveyQuestionBaseProps } from "survey-engine";

import { getSurveyQuestionTitle } from "@/services/resource/survey/getSurveyQuestionTitle";

interface Props {
  // The message the runner gives the question, "" while it has none, drawn under the control and marking it invalid
  error: string;
  // The question the shell titles: its title, its description and whether it is required are all drawn from it
  question: SurveyQuestionBaseProps;
}

defineSlots<{ default: (props: { describedBy?: string; labelledBy: string; title: string }) => VNode }>();
const { error, question } = defineProps<Props>();
const id = useId();
const titleId = useId();
const descriptionId = `${id}-description`;
const errorId = `${id}-error`;
// The description and the error a control is described by, so a reader of speech hears both with it
const describedBy = computed(
  () => [question.description && descriptionId, error && errorId].filter(Boolean).join(" ") || undefined,
);
</script>

<template>
  <div flex flex-col gap-1>
    <span :id="titleId" text-sm text-muted>
      {{ getSurveyQuestionTitle(question) }}
      <UiRequiredMark v-if="question.isRequired" />
    </span>
    <span v-if="question.description" :id="descriptionId" text-sm text-muted>{{ question.description }}</span>
    <slot :described-by :labelled-by="titleId" :title="getSurveyQuestionTitle(question)" />
    <span v-if="error" :id="errorId" role="alert" text-sm text-error>{{ error }}</span>
  </div>
</template>
