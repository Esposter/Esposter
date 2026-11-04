<script setup lang="ts">
import type { UiMenuItem } from "@/models/ui/UiMenuItem";
import type { SurveyAnswerValue, SurveyDropdownNode, SurveyRadioGroupNode } from "survey-engine";

interface Props {
  // The message the runner gives the question when it fails a check, "" when it has none
  error: string;
  isDisabled: boolean;
  node: SurveyDropdownNode | SurveyRadioGroupNode;
  // What the shuffled choices are ordered by, the session's seed, so a respondent sees one order throughout
  seed: string;
}

// The control the kind draws is the default slot's, given the pick the choice answer makes and the title the shell draws
defineSlots<{
  default: (props: {
    items: UiMenuItem<string>[];
    pick: (key: string | undefined) => void;
    selectedKey?: string;
    title: string;
  }) => VNode;
}>();
const answer = defineModel<SurveyAnswerValue | undefined>({ default: undefined });
const { error, isDisabled, node, seed } = defineProps<Props>();
const { isOther, items, otherText, otherTitle, pick, selectedKey, updateOtherText } = useSurveyChoiceAnswer(
  answer,
  () => node.props,
  seed,
);
</script>

<template>
  <ResourceSurveyFieldShell :error :question="node.props">
    <template #default="{ title }">
      <slot :items :pick :selected-key :title />
      <UiTextField
        v-if="isOther"
        :is-disabled="isDisabled || undefined"
        :label="otherTitle"
        :model-value="otherText"
        @update:model-value="(value) => updateOtherText(value)"
      />
    </template>
  </ResourceSurveyFieldShell>
</template>
