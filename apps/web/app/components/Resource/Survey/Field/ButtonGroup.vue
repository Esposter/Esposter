<script setup lang="ts">
import type { UiMenuItem } from "@/models/ui/UiMenuItem";
import type { SurveyAnswerValue, SurveyButtonGroupNode } from "headless-survey-engine";

import { getSurveyChoiceText } from "headless-survey-engine";

interface Props {
  error: string;
  isDisabled: boolean;
  node: SurveyButtonGroupNode;
}
// A choice drawn as a toggle group, whose model is a choice's own value. An answer no choice has yet is the empty text.
// That is a select's absent value too, since the group's model cannot be undefined
const answer = defineModel<SurveyAnswerValue | undefined>({ default: undefined });
const { error, isDisabled, node } = defineProps<Props>();
const items = computed<UiMenuItem<number | string>[]>(() =>
  node.props.choices.map((choice) => ({ title: getSurveyChoiceText(choice), value: choice.value })),
);
const choice = computed<number | string>({
  get: () => (typeof answer.value === "number" || typeof answer.value === "string" ? answer.value : ""),
  set: (value) => {
    answer.value = value;
  },
});
</script>

<template>
  <ResourceSurveyFieldShell :error :question="node.props">
    <template #default="{ describedBy, title }">
      <UiToggleGroup
        v-model="choice"
        :aria-describedby="describedBy"
        :aria-invalid="error ? true : undefined"
        :aria-required="node.props.isRequired ? true : undefined"
        :is-disabled="isDisabled || undefined"
        :items
        :label="title"
      />
    </template>
  </ResourceSurveyFieldShell>
</template>
