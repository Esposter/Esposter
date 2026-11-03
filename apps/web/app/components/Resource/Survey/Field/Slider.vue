<script setup lang="ts">
import type { SurveyAnswerValue, SurveySliderNode } from "survey-engine";

interface Props {
  error: string;
  isDisabled: boolean;
  node: SurveySliderNode;
}
// A number picked along the range. With no answer yet the thumb sits at the minimum, and an answer is written only once
// The respondent moves it, so an untouched question stays unanswered
const answer = defineModel<SurveyAnswerValue | undefined>({ default: undefined });
const { error, isDisabled, node } = defineProps<Props>();
const label = computed(() => node.props.title || node.props.name);
const value = computed<number>({
  get: () => (typeof answer.value === "number" ? answer.value : node.props.min),
  set: (next) => {
    answer.value = next;
  },
});
// A hidden value is an empty reading, so assistive technology reads the thumb by its own number instead
const valueText = computed(() => (node.props.showValue ? String(value.value) : ""));
</script>

<template>
  <div flex flex-col gap-1>
    <span v-if="node.props.description" text-sm text-muted>{{ node.props.description }}</span>
    <!-- Inert while disabled, so the thumb takes no focus and no press, and drawn faded as a disabled control is -->
    <div :class="{ 'op-disabled': isDisabled }" :inert="isDisabled">
      <UiSlider
        v-model="value"
        :label
        :max="node.props.max"
        :min="node.props.min"
        :step="node.props.step"
        :value-text
      />
    </div>
    <span v-if="error" role="alert" text-sm text-error>{{ error }}</span>
  </div>
</template>
