<script setup lang="ts">
import type { UiMenuItem } from "@/models/ui/UiMenuItem";
import type { SurveyAnswerValue, SurveyButtonGroupNode } from "survey-engine";

import { getSurveyChoiceText } from "survey-engine";

interface Props {
  error: string;
  isDisabled: boolean;
  node: SurveyButtonGroupNode;
}
// A choice drawn as a toggle group, whose model is a choice's own value. An answer no choice has yet is the empty text.
// That is a select's absent value too, since the group's model cannot be undefined
const answer = defineModel<SurveyAnswerValue | undefined>({ default: undefined });
const { error, isDisabled, node } = defineProps<Props>();
const label = computed(() => node.props.title || node.props.name);
const items = computed<UiMenuItem<number | string>[]>(() =>
  node.props.choices.map((choice) => ({ isDisabled, title: getSurveyChoiceText(choice), value: choice.value })),
);
const choice = computed<number | string>({
  get: () => (typeof answer.value === "number" || typeof answer.value === "string" ? answer.value : ""),
  set: (value) => {
    answer.value = value;
  },
});
</script>

<template>
  <ResourceSurveyFieldShell
    :description="node.props.description"
    :error
    :is-required="node.props.isRequired"
    :title="label"
  >
    <template #default="{ describedBy }">
      <UiToggleGroup
        v-model="choice"
        :aria-describedby="describedBy"
        :aria-invalid="error ? true : undefined"
        :aria-required="node.props.isRequired ? true : undefined"
        :items
        :label
      />
    </template>
  </ResourceSurveyFieldShell>
</template>
