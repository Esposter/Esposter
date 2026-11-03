<script setup lang="ts">
import type { UiMenuItem } from "@/models/ui/UiMenuItem";
import type { SurveyAnswerValue, SurveyBooleanNode } from "survey-engine";

import { SurveyBooleanDisplayStyle } from "survey-engine";

interface Props {
  // The message the runner gives this question, "" while it has none, drawn beside the field and marking it invalid
  error: string;
  isDisabled: boolean;
  node: SurveyBooleanNode;
}

const answer = defineModel<SurveyAnswerValue | undefined>();
const { error, isDisabled, node } = defineProps<Props>();
const REQUIRED_HINT = "Required";
const title = computed(() => node.props.title || node.props.name);
const hint = computed(() =>
  node.props.isRequired ? [node.props.description, REQUIRED_HINT].filter(Boolean).join(" ") : node.props.description,
);
const isChecked = computed(() => answer.value === true);
// The label beside a switch or a box is the one the question gives its state, and empty until it gives one
const stateLabel = computed(() => (isChecked.value ? node.props.labelTrue : node.props.labelFalse));
// A radio group holds its answer as text, so each of its two options is read back as the boolean it stands for
const items = computed<UiMenuItem<string>[]>(() => [
  { title: node.props.labelTrue || "Yes", value: "true" },
  { title: node.props.labelFalse || "No", value: "false" },
]);
const choice = computed({
  get: () => (answer.value === undefined ? undefined : String(answer.value)),
  set: (value) => {
    answer.value = value === undefined ? undefined : value === "true";
  },
});
const setChecked = (isOn: boolean) => {
  answer.value = isOn;
};
</script>

<template>
  <div flex flex-col gap-1>
    <span text-sm text-muted>{{ title }}</span>
    <UiSwitch
      v-if="node.props.displayStyle === SurveyBooleanDisplayStyle.Switch"
      :aria-invalid="error ? true : undefined"
      :aria-label="title"
      :disabled="isDisabled"
      :label="stateLabel"
      :model-value="isChecked"
      is-label-shown
      @update:model-value="setChecked"
    />
    <UiRadioGroup
      v-else-if="node.props.displayStyle === SurveyBooleanDisplayStyle.Radio"
      v-model="choice"
      :is-disabled="isDisabled"
      :items
      :label="title"
    />
    <UiCheckbox
      v-else
      :aria-invalid="error ? true : undefined"
      :aria-label="title"
      :disabled="isDisabled"
      :label="stateLabel"
      :model-value="isChecked"
      is-label-shown
      @update:model-value="setChecked"
    />
    <span v-if="hint" text-sm text-muted>{{ hint }}</span>
    <span v-if="error" role="alert" text-sm text-error>{{ error }}</span>
  </div>
</template>
