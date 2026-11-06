<script setup lang="ts">
import { useSurveyCreatorDrag } from "@/composables/survey/useSurveyCreatorDrag";
import { getSurveyPaletteGroups } from "@/services/resource/survey/getSurveyPaletteGroups";
import { useSurveyCreatorStore } from "@/store/survey/creator";
import { SurveyNodeType } from "vue-survey-engine-headless";

const surveyCreatorStore = useSurveyCreatorStore();
const { document: surveyDocument, selectedPointer } = storeToRefs(surveyCreatorStore);
const { insertNode } = useSurveyCreatorCommands();
const { startPaletteDrag } = useSurveyCreatorDrag();
// The kinds listed are the ones an insertion at the selection takes, so a kind no slot there accepts is not offered
const groups = computed(() => getSurveyPaletteGroups(surveyDocument.value, selectedPointer.value));

// The palette names a kind by its string, so the enum member it matches is found rather than cast
const toSurveyNodeType = (kind: string) => Object.values(SurveyNodeType).find((type) => type === kind);
const insertKind = (kind: string) => {
  const type = toSurveyNodeType(kind);
  if (type !== undefined) insertNode(type);
};
const dragKind = (kind: string, event: PointerEvent) => {
  const type = toSurveyNodeType(kind);
  if (type !== undefined) startPaletteDrag(type, event);
};
</script>

<template>
  <UiPalette :groups @insert="(kind) => insertKind(kind)" @drag-start="(kind, event) => dragKind(kind, event)" />
</template>
