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

// The default is what keeps an unanswered question undefined: a boolean prop left out of a mount is cast to false, which
// Would read as an answer of No and pre-select that option
const answer = defineModel<SurveyAnswerValue | undefined>({ default: undefined });
const { error, isDisabled, node } = defineProps<Props>();
const title = computed(() => node.props.title || node.props.name);
const isChecked = computed({
  get: () => answer.value === true,
  set: (isOn) => {
    answer.value = isOn;
  },
});
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
</script>

<template>
  <ResourceSurveyFieldShell :description="node.props.description" :error :is-required="node.props.isRequired" :title>
    <template #default="{ describedBy, labelledBy }">
      <UiSwitch
        v-if="node.props.displayStyle === SurveyBooleanDisplayStyle.Switch"
        v-model="isChecked"
        :aria-describedby="describedBy"
        :aria-invalid="error ? true : undefined"
        :aria-label="title"
        :aria-labelledby="labelledBy"
        :disabled="isDisabled"
        :label="stateLabel"
        is-label-shown
      />
      <UiRadioGroup
        v-else-if="node.props.displayStyle === SurveyBooleanDisplayStyle.Radio"
        v-model="choice"
        :aria-invalid="error ? true : undefined"
        :aria-required="node.props.isRequired ? true : undefined"
        :is-disabled
        :items
        :label="title"
      />
      <UiCheckbox
        v-else
        v-model="isChecked"
        :aria-describedby="describedBy"
        :aria-invalid="error ? true : undefined"
        :aria-label="title"
        :aria-labelledby="labelledBy"
        :disabled="isDisabled"
        :label="stateLabel"
        is-label-shown
      />
    </template>
  </ResourceSurveyFieldShell>
</template>
