<script setup lang="ts">
import { useSurveyCreatorDrag } from "@/composables/survey/useSurveyCreatorDrag";
import { getSurveyPaletteGroups } from "@/services/resource/survey/getSurveyPaletteGroups";
import { SurveyNodeType } from "headless-survey-engine";

const { insertNode } = useSurveyCreatorCommands();
const { startPaletteDrag } = useSurveyCreatorDrag();

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
  <UiPalette :groups="getSurveyPaletteGroups()" @insert="insertKind" @drag-start="dragKind" />
</template>
