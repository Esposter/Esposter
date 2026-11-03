<script setup lang="ts">
import { useSurveyCreatorStore } from "@/store/survey/creator";
import { getBlockNode } from "headless-block-editor";
import { SurveyNodeType, surveyNodeChildren } from "survey-engine";

interface Props {
  pointer: string;
}

const { pointer } = defineProps<Props>();
const surveyCreatorStore = useSurveyCreatorStore();
const { document: surveyDocument } = storeToRefs(surveyCreatorStore);
const { updateNodeProps } = useSurveyCreatorCommands();
const { uploadPicked } = useSurveyFiles();
// The picture the node at the pointer holds, which is empty for a node that is not an image
const imageLink = computed(() => {
  const node = getBlockNode(surveyDocument.value, pointer, surveyNodeChildren);
  return node?.type === SurveyNodeType.Image ? node.props.imageLink : "";
});
// The picture is uploaded as it is picked, and its url written to the question once the upload lands. A rejected file
// Leaves the question as it was
const onPick = (files: File[]) => uploadPicked(files, (url) => updateNodeProps(pointer, { imageLink: url }));
</script>

<template>
  <div flex flex-col gap-2>
    <UiFileField
      accept="image/*"
      :label="imageLink ? 'Replace image' : 'Upload image'"
      :model-value="[]"
      @update:model-value="(files) => onPick(files)"
    />
    <UiButton v-if="imageLink" @click="updateNodeProps(pointer, { imageLink: '' })">Remove image</UiButton>
  </div>
</template>
