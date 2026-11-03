<script setup lang="ts">
import type { SurveyAnswerValue, SurveyDropdownNode } from "survey-engine";

interface Props {
  // The message the runner gives this question, "" while it has none, drawn beside the field
  error: string;
  isDisabled: boolean;
  node: SurveyDropdownNode;
}

const answer = defineModel<SurveyAnswerValue | undefined>();
const { error, isDisabled, node } = defineProps<Props>();
const REQUIRED_HINT = "Required";
const title = computed(() => node.props.title || node.props.name);
const hint = computed(() =>
  node.props.isRequired ? [node.props.description, REQUIRED_HINT].filter(Boolean).join(" ") : node.props.description,
);
const { isOther, items, otherText, otherTitle, pick, selectedKey, updateOtherText } = useSurveyChoiceAnswer(
  answer,
  () => node.props,
);
</script>

<template>
  <div flex flex-col gap-1>
    <span text-sm text-muted>{{ title }}</span>
    <UiSelect
      :is-disabled="isDisabled"
      :items
      :label="title"
      :model-value="selectedKey ?? ''"
      @update:model-value="pick"
    />
    <UiTextField
      v-if="isOther"
      :is-disabled="isDisabled || undefined"
      :label="otherTitle"
      :model-value="otherText"
      @update:model-value="updateOtherText"
    />
    <span v-if="hint" text-sm text-muted>{{ hint }}</span>
    <span v-if="error" role="alert" text-sm text-error>{{ error }}</span>
  </div>
</template>
