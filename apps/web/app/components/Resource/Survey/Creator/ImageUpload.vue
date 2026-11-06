<script setup lang="ts">
import { SurveyNodeType } from "vue-survey-engine-headless";

interface Props {
  pointer: string;
}

const { pointer } = defineProps<Props>();
const { node, updateNodeProps, uploadPicked } = useSurveyPointerNode(() => pointer);
// The picture the node at the pointer holds, which is empty for a node that is not an image
const imageLink = computed(() => {
  const picture = node.value;
  return picture?.type === SurveyNodeType.Image ? picture.props.imageLink : "";
});
// The picture is uploaded as it is picked, and its url written to the question once the upload lands. A rejected file
// Leaves the question as it was
const onPick = (files: File[]) => uploadPicked(files, (url) => updateNodeProps({ imageLink: url }));
</script>

<template>
  <div flex flex-col gap-2>
    <UiFileField
      accept="image/*"
      :label="imageLink ? 'Replace image' : 'Upload image'"
      :model-value="[]"
      @update:model-value="(files) => onPick(files)"
    />
    <UiButton v-if="imageLink" @click="updateNodeProps({ imageLink: '' })">Remove image</UiButton>
  </div>
</template>
