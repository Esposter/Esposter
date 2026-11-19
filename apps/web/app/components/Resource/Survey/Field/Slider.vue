<script setup lang="ts">
import type { SurveyAnswerValue, SurveySliderNode } from "vue-survey-engine-headless";

import { getSurveyQuestionTitle } from "#src/services/resource/survey/getSurveyQuestionTitle";

interface Props {
  error: string;
  isDisabled: boolean;
  node: SurveySliderNode;
}
// A number picked along the range. With no answer yet the thumb sits at the minimum, and an answer is written only once
// The respondent moves it, so an untouched question stays unanswered
const answer = defineModel<SurveyAnswerValue | undefined>({ default: undefined });
const { error, node } = defineProps<Props>();
const id = useId();
const descriptionId = `${id}-description`;
const errorId = `${id}-error`;
const value = computed<number>({
  get: () => (typeof answer.value === "number" ? answer.value : node.props.min),
  set: (next) => {
    answer.value = next;
  },
});
// A hidden value is an empty reading, so assistive technology reads the thumb by its own number instead
const valueText = computed(() => (node.props.isValueVisible ? String(value.value) : ""));
// The description and the error the thumb is described by, so a reader of speech hears both with its value
const describedBy = computed(
  () => [node.props.description && descriptionId, error && errorId].filter(Boolean).join(" ") || undefined,
);
</script>

<template>
  <div flex flex-col gap-1>
    <span v-if="node.props.description" :id="descriptionId" text-sm text-muted>{{ node.props.description }}</span>
    <UiSlider
      v-model="value"
      :described-by
      :is-disabled="isDisabled || undefined"
      :is-invalid="error ? true : undefined"
      :is-required="node.props.isRequired || undefined"
      :label="getSurveyQuestionTitle(node.props)"
      :max="node.props.max"
      :min="node.props.min"
      :step="node.props.step"
      :value-text
    />
    <span v-if="error" :id="errorId" role="alert" text-sm text-error>{{ error }}</span>
  </div>
</template>
