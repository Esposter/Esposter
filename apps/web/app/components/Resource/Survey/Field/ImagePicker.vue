<script setup lang="ts">
import type { UiListItem } from "@/models/ui/UiListItem";
import type { SurveyAnswerValue, SurveyImagePickerNode } from "vue-survey-engine-headless";

import { SURVEY_IMAGE_FIT_CLASSES } from "@/services/resource/survey/constants";
import { getSurveyKeyedChoices } from "@/services/resource/survey/getSurveyKeyedChoices";
import { getSurveyChoiceText } from "vue-survey-engine-headless";

interface Props {
  // The message the runner gives the question when it fails a check, "" when it has none
  error: string;
  isDisabled: boolean;
  node: SurveyImagePickerNode;
}

const answer = defineModel<SurveyAnswerValue | undefined>({ default: undefined });
const { error, isDisabled, node } = defineProps<Props>();
const items = computed<(UiListItem<string> & { imageLink: string })[]>(() =>
  getSurveyKeyedChoices(node.props.choices).map(({ choice, key }) => ({
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
// A picture its author sized is drawn at those pixels, and one left unsized fills the row's default mark box
const isSized = computed(() => node.props.imageWidth !== undefined || node.props.imageHeight !== undefined);
const pictureStyle = computed(() => ({
  height: node.props.imageHeight === undefined ? undefined : `${node.props.imageHeight}px`,
  width: node.props.imageWidth === undefined ? undefined : `${node.props.imageWidth}px`,
}));
const selectedKeys = computed(() =>
  getSurveyKeyedChoices(node.props.choices)
    .filter(({ choice }) => selectedValues.value.includes(choice.value))
    .map(({ key }) => key),
);
// The list hands back the picked keys, each read back to the value its choice holds
const onSelect = (keys: string[] | undefined = []) => {
  if (isDisabled) return;
  const values = getSurveyKeyedChoices(node.props.choices)
    .filter(({ key }) => keys.includes(key))
    .map(({ choice }) => choice.value);
  answer.value = node.props.multiSelect ? values : values[0];
};
</script>

<template>
  <ResourceSurveyFieldShell :error :question="node.props">
    <template #default="{ describedBy, title }">
      <!-- Each picture is a row of the list, so the arrows and Enter or Space pick it as they pick any listbox option -->
      <UiList
        :aria-describedby="describedBy"
        :aria-invalid="error ? true : undefined"
        :aria-required="node.props.isRequired ? true : undefined"
        :is-multiple="node.props.multiSelect || undefined"
        :items
        :label="title"
        :model-value="selectedKeys"
        @update:model-value="(keys) => onSelect(keys)"
      >
        <template #mark="{ item }">
          <NuxtImg
            :alt="item.title"
            :class="[SURVEY_IMAGE_FIT_CLASSES[node.props.imageFit], { 'size-6': !isSized }]"
            :src="item.imageLink"
            :style="pictureStyle"
          />
        </template>
        <template #title="{ item }">
          <span :class="{ 'sr-only': !node.props.isLabelVisible }">{{ item.title }}</span>
        </template>
      </UiList>
    </template>
  </ResourceSurveyFieldShell>
</template>
