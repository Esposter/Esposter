<script setup lang="ts">
import type { SurveyImageChoice } from "survey-engine";

import { useSurveyCreatorStore } from "@/store/survey/creator";
import { UiButtonVariant } from "@/models/ui/UiButtonVariant";
import { UiIconMeaning } from "@/models/ui/UiIconMeaning";
import { createErrorAlert } from "@/services/trpc/createErrorAlert";
import { getResultAsync } from "@esposter/shared";
import { getBlockNode } from "headless-block-editor";
import { SurveyNodeType, surveyNodeChildren } from "survey-engine";

interface Props {
  pointer: string;
}

const { pointer } = defineProps<Props>();
const surveyCreatorStore = useSurveyCreatorStore();
const { document: surveyDocument } = storeToRefs(surveyCreatorStore);
const { updateNodeProps } = useSurveyCreatorCommands();
const { upload } = useSurveyFiles();
// The choices of the picker at the pointer, or none when the node there is not an image picker
const choices = computed(() => {
  const node = getBlockNode(surveyDocument.value, pointer, surveyNodeChildren);
  return node?.type === SurveyNodeType.ImagePicker ? node.props.choices : [];
});
// The choices are written whole, so the list the document keeps is the order the editor shows
const writeChoices = (nextChoices: SurveyImageChoice[]) => updateNodeProps(pointer, { choices: nextChoices });
const updateChoice = (index: number, change: Partial<SurveyImageChoice>) =>
  writeChoices(choices.value.map((choice, choiceIndex) => (choiceIndex === index ? { ...choice, ...change } : choice)));
const removeChoice = (index: number) =>
  writeChoices(choices.value.filter((_choice, choiceIndex) => choiceIndex !== index));
const moveChoice = (index: number, toIndex: number) => {
  const [choice] = choices.value.slice(index, index + 1);
  if (choice && toIndex >= 0 && toIndex < choices.value.length)
    writeChoices(choices.value.toSpliced(index, 1).toSpliced(toIndex, 0, choice));
};
// A picked image adds a choice, since a choice cannot be saved without its picture. Its value is a fresh id, which
// Keeps it unique among the choices, since a respondent's answer holds the value
const addChoice = async (files: File[]) => {
  const [file] = files;
  if (!file) return;

  const uploadResult = await getResultAsync(() => upload(file));
  uploadResult.match((url) => {
    if (url) writeChoices([...choices.value, { imageLink: url, text: "", value: crypto.randomUUID() }]);
  }, createErrorAlert);
};
const replaceImage = async (index: number, files: File[]) => {
  const [file] = files;
  if (!file) return;

  const uploadResult = await getResultAsync(() => upload(file));
  uploadResult.match((url) => {
    if (url) updateChoice(index, { imageLink: url });
  }, createErrorAlert);
};
</script>

<template>
  <div flex flex-col gap-4>
    <div v-for="(choice, index) of choices" :key="index" flex flex-col gap-2>
      <UiTextField
        :label="`Value of choice ${index + 1}`"
        :model-value="String(choice.value)"
        @update:model-value="(value) => updateChoice(index, { value })"
      />
      <UiTextField
        :label="`Text of choice ${index + 1}`"
        :model-value="choice.text"
        @update:model-value="(text) => updateChoice(index, { text })"
      />
      <UiFileField
        accept="image/*"
        :label="`Replace image of choice ${index + 1}`"
        :model-value="[]"
        @update:model-value="(files) => replaceImage(index, files)"
      />
      <div flex gap-1>
        <UiIconButton
          :disabled="index === 0"
          :label="`Move choice ${index + 1} up`"
          :meaning="UiIconMeaning.ArrowUp"
          :variant="UiButtonVariant.Quiet"
          @click="moveChoice(index, index - 1)"
        />
        <UiIconButton
          :disabled="index === choices.length - 1"
          :label="`Move choice ${index + 1} down`"
          :meaning="UiIconMeaning.ArrowDown"
          :variant="UiButtonVariant.Quiet"
          @click="moveChoice(index, index + 1)"
        />
        <UiIconButton
          :label="`Remove choice ${index + 1}`"
          :meaning="UiIconMeaning.Remove"
          :variant="UiButtonVariant.Quiet"
          @click="removeChoice(index)"
        />
      </div>
    </div>
    <UiFileField
      accept="image/*"
      label="Add a choice from an image"
      :model-value="[]"
      @update:model-value="(files) => addChoice(files)"
    />
  </div>
</template>
