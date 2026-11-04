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
</script>

<template>
  <ResourceSurveyFieldSingleChoice v-model="answer" :error :is-disabled :node :seed>
    <template #default="{ describedBy, items, pick, selectedKey, title }">
      <UiRadioGroup
        :aria-describedby="describedBy"
        :aria-invalid="error ? true : undefined"
        :aria-required="node.props.isRequired ? true : undefined"
        :is-disabled
        :items
        :label="title"
        :model-value="selectedKey"
        @update:model-value="(key) => pick(key)"
      />
    </template>
  </ResourceSurveyFieldSingleChoice>
</template>
