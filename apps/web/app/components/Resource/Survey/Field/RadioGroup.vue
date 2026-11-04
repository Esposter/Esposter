<script setup lang="ts">
import type { SurveyAnswerValue, SurveyRadioGroupNode } from "survey-engine";

interface Props {
  // The message the runner gives this question, "" while it has none, drawn beside the field
  error: string;
  isDisabled: boolean;
  node: SurveyRadioGroupNode;
  // What the shuffled choices are ordered by, the session's seed, so a respondent sees one order throughout
  seed: string;
}

const answer = defineModel<SurveyAnswerValue | undefined>({ default: undefined });
const { error, isDisabled, node, seed } = defineProps<Props>();
const title = computed(() => node.props.title || node.props.name);
const { isOther, items, otherText, otherTitle, pick, selectedKey, updateOtherText } = useSurveyChoiceAnswer(
  answer,
  () => node.props,
  seed,
);
</script>

<template>
  <ResourceSurveyFieldShell :description="node.props.description" :error :is-required="node.props.isRequired" :title>
    <UiRadioGroup
      :aria-invalid="error ? true : undefined"
      :aria-required="node.props.isRequired ? true : undefined"
      :is-disabled
      :items
      :label="title"
      :model-value="selectedKey"
      @update:model-value="(key) => pick(key)"
    />
    <UiTextField
      v-if="isOther"
      :is-disabled="isDisabled || undefined"
      :label="otherTitle"
      :model-value="otherText"
      @update:model-value="(value) => updateOtherText(value)"
    />
  </ResourceSurveyFieldShell>
</template>
