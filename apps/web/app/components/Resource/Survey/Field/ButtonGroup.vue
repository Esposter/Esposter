<script setup lang="ts">
import type { UiMenuItem } from "@/models/ui/UiMenuItem";
import type { SurveyAnswerValue, SurveyButtonGroupNode } from "survey-engine";

interface Props {
  error: string;
  isDisabled: boolean;
  node: SurveyButtonGroupNode;
}
// A choice drawn as a toggle group, whose model is a choice's own value. An answer no choice has yet is the empty text,
// as a select's absent value is, because the group's model cannot be undefined
const answer = defineModel<SurveyAnswerValue | undefined>();
const { error, isDisabled, node } = defineProps<Props>();
const id = useId();
const label = computed(() => node.props.title || node.props.name);
const items = computed<UiMenuItem<number | string>[]>(() =>
  node.props.choices.map(({ text, value }) => ({ isDisabled, title: text || String(value), value })),
);
const choice = computed<number | string>({
  get: () => (typeof answer.value === "number" || typeof answer.value === "string" ? answer.value : ""),
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
      v-model="choice"
      :aria-describedby="node.props.description ? `${id}-description` : undefined"
      :aria-invalid="error ? true : undefined"
      :aria-required="node.props.isRequired ? true : undefined"
      :items
      :label
    />
    <span v-if="error" role="alert" text-sm text-error>{{ error }}</span>
  </div>
</template>
