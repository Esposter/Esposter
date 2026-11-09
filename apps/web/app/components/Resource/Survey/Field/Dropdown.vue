<script setup lang="ts">
import type { SurveyAnswerValue, SurveyDropdownNode } from "vue-survey-engine-headless";

interface Props {
  // The message the runner gives this question, "" while it has none, drawn beside the field
  error: string;
  isDisabled: boolean;
  node: SurveyDropdownNode;
  // What the shuffled choices are ordered by, the session's seed, so a respondent sees one order throughout
  seed: string;
}

const answer = defineModel<SurveyAnswerValue | undefined>({ default: undefined });
defineProps<Props>();
</script>

<template>
  <ResourceSurveyFieldSingleChoice v-model="answer" :error :is-disabled :node :seed>
    <template #default="{ describedBy, items, pick, selectedKey, title }">
      <UiSelect
        :aria-describedby="describedBy"
        :aria-invalid="error ? true : undefined"
        :aria-required="node.props.isRequired ? true : undefined"
        :is-disabled
        :items
        :label="title"
        :model-value="selectedKey ?? ''"
        :placeholder="node.props.placeholder"
        @update:model-value="(key) => pick(key)"
      />
    </template>
  </ResourceSurveyFieldSingleChoice>
</template>
