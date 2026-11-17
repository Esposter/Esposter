<script setup lang="ts">
import type { SurveyRootStringPropName } from "#src/models/resource/survey/SurveyRootStringPropName";

import { useSurveyCreatorStore } from "#src/store/survey/creator";

interface Props {
  // The button's words, which say what clearing does: removing a picture, clearing a colour
  clearLabel: string;
  // The root prop the row's field writes and its button clears
  name: SurveyRootStringPropName;
}

defineProps<Props>();
const surveyCreatorStore = useSurveyCreatorStore();
const { document: surveyDocument } = storeToRefs(surveyCreatorStore);
const { updateRootProps } = useSurveyCreatorCommands();
</script>

<!-- A field over its clear button, which is off while the prop is empty and writes it empty -->
<template>
  <div flex flex-col gap-2>
    <slot />
    <UiButton :disabled="!surveyDocument.root.props[name]" @click="updateRootProps({ [name]: '' })">
      {{ clearLabel }}
    </UiButton>
  </div>
</template>
