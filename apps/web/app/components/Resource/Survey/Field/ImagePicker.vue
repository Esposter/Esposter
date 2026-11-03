<script setup lang="ts">
import type { UiListItem } from "@/models/ui/UiListItem";
import type { SurveyAnswerValue, SurveyImageChoice, SurveyImagePickerNode } from "survey-engine";

import { getSurveyChoiceText, SurveyImageFit } from "survey-engine";

interface Props {
  // The message the runner gives the question when it fails a check, "" when it has none
  error: string;
  isDisabled: boolean;
  node: SurveyImagePickerNode;
}
interface KeyedChoice {
  choice: SurveyImageChoice;
  key: string;
}

// The class each fit draws a picture with, written whole so the utility generator sees every one
const IMAGE_FIT_CLASSES: Record<SurveyImageFit, string> = {
  [SurveyImageFit.Contain]: "object-contain",
  [SurveyImageFit.Cover]: "object-cover",
  [SurveyImageFit.Fill]: "object-fill",
  [SurveyImageFit.None]: "object-none",
};

const answer = defineModel<SurveyAnswerValue | undefined>();
const { error, isDisabled, node } = defineProps<Props>();
const label = computed(() => node.props.title || node.props.name);
const imageFitClass = computed(() => IMAGE_FIT_CLASSES[node.props.imageFit]);
// A choice is keyed by its place in the question, since two values may read alike and a list keys its rows by text
const keyedChoices = computed<KeyedChoice[]>(() =>
  node.props.choices.map((choice, index) => ({ choice, key: String(index) })),
);
const items = computed<(UiListItem<string> & { imageLink: string })[]>(() =>
  keyedChoices.value.map(({ choice, key }) => ({
    hasMarkSlot: true,
    imageLink: choice.imageLink,
    title: getSurveyChoiceText(choice),
    value: key,
  })),
);
// One answer holds a single value and several hold a list of them, so the picked values are read either way
const selectedValues = computed<SurveyAnswerValue[]>(() => {
  if (answer.value === undefined) return [];
  return Array.isArray(answer.value) ? answer.value : [answer.value];
});
const selectedKeys = computed(() =>
  keyedChoices.value.filter(({ choice }) => selectedValues.value.includes(choice.value)).map(({ key }) => key),
);
// The list hands back the picked keys, each read back to the value its choice holds
const onSelect = (keys: string[] | undefined = []) => {
  if (isDisabled) return;
  const values = keyedChoices.value.filter(({ key }) => keys.includes(key)).map(({ choice }) => choice.value);
  answer.value = node.props.multiSelect ? values : values[0];
};
</script>

<template>
  <ResourceSurveyFieldShell
    :description="node.props.description"
    :error
    :is-required="node.props.isRequired"
    :title="label"
  >
    <template #default="{ describedBy }">
      <!-- Each picture is a row of the list, so the arrows and Enter or Space pick it as they pick any listbox option -->
      <UiList
        :aria-describedby="describedBy"
        :aria-invalid="error ? true : undefined"
        :is-multiple="node.props.multiSelect || undefined"
        :items
        :label
        :model-value="selectedKeys"
        @update:model-value="onSelect"
      >
        <template #mark="{ item }">
          <NuxtImg :alt="item.title" :class="imageFitClass" :src="item.imageLink" size-full />
        </template>
        <template #title="{ item }">
          <span :class="{ 'sr-only': !node.props.showLabel }">{{ item.title }}</span>
        </template>
      </UiList>
    </template>
  </ResourceSurveyFieldShell>
</template>
