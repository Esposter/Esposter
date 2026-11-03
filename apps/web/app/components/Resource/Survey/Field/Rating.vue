<script setup lang="ts">
import type { UiMenuItem } from "@/models/ui/UiMenuItem";
import type { SurveyAnswerValue, SurveyRatingNode } from "survey-engine";

interface Props {
  error: string;
  isDisabled: boolean;
  node: SurveyRatingNode;
}
// A number from one up to the scale's count, drawn as a toggle group of its numbers with the text at either end. No icon
// names a star or a smiley, so every rate type draws its numbers, and the scale's type waits for one that does
const answer = defineModel<SurveyAnswerValue | undefined>();
const { error, isDisabled, node } = defineProps<Props>();
const id = useId();
const label = computed(() => node.props.title || node.props.name);
const items = computed<UiMenuItem<number>[]>(() =>
  Array.from({ length: node.props.rateCount }, (_, index) => ({
    isDisabled,
    title: String(index + 1),
    value: index + 1,
  })),
);
// An answer no step has yet is the empty text, as a choice group's absent value is
const rating = computed<number | string>({
  get: () => (typeof answer.value === "number" ? answer.value : ""),
  set: (value) => {
    answer.value = value;
  },
});
</script>

<template>
  <div flex flex-col gap-1>
    <span text-sm text-muted>
      {{ label }}
      <span v-if="node.props.isRequired" aria-hidden="true" text-error>*</span>
    </span>
    <span v-if="node.props.description" :id="`${id}-description`" text-sm text-muted>
      {{ node.props.description }}
    </span>
    <UiToggleGroup
      v-model="rating"
      :aria-describedby="node.props.description ? `${id}-description` : undefined"
      :aria-invalid="error ? true : undefined"
      :aria-required="node.props.isRequired ? true : undefined"
      :items
      :label
    />
    <div
      v-if="node.props.minRateDescription || node.props.maxRateDescription"
      flex
      justify-between
      gap-2
      text-sm
      text-muted
    >
      <span>{{ node.props.minRateDescription }}</span>
      <span>{{ node.props.maxRateDescription }}</span>
    </div>
    <span v-if="error" role="alert" text-sm text-error>{{ error }}</span>
  </div>
</template>
