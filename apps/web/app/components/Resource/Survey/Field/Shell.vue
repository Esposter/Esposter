<script setup lang="ts">
import type { SurveyQuestionBaseProps } from "vue-survey-engine-headless";

import { useSurveyDescribedBy } from "#src/composables/resource/survey/useSurveyDescribedBy";
import { getSurveyQuestionTitle } from "#src/services/resource/survey/getSurveyQuestionTitle";

interface Props {
  // The message the runner gives the question, "" while it has none, drawn under the control and marking it invalid
  error: string;
  // The question the shell titles: its title, its description and whether it is required are all drawn from it
  question: SurveyQuestionBaseProps;
}

defineSlots<{ default: (props: { describedBy?: string; labelledBy: string; title: string }) => VNode }>();
const { error, question } = defineProps<Props>();
const titleId = useId();
// The description and the error a control is described by, so a reader of speech hears both with it
const { describedBy, descriptionId, errorId } = useSurveyDescribedBy(
  () => question.description,
  () => error,
);
</script>

<template>
  <div flex flex-col gap-1>
    <UiFieldLabel
      :id="titleId"
      :is-required="question.isRequired || undefined"
      :label="getSurveyQuestionTitle(question)"
    />
    <span v-if="question.description" :id="descriptionId" text-sm text-muted>{{ question.description }}</span>
    <slot :described-by :labelled-by="titleId" :title="getSurveyQuestionTitle(question)" />
    <span v-if="error" :id="errorId" role="alert" text-sm text-error>{{ error }}</span>
  </div>
</template>
