<script setup lang="ts">
import type { SurveyPlaceableNode } from "headless-survey-engine";

interface Props {
  // The elements a page or a panel holds, in order
  children: SurveyPlaceableNode[];
  // The slot's pointer, from which each element's pointer follows
  slotPointer: string;
}

const { children, slotPointer } = defineProps<Props>();
const { dropTarget, previewNode } = useSurveyCreatorDrag();
// The preview stands among the elements, at the index a drop over this slot would land at. The document itself is not changed
const isPreviewAt = (index: number) =>
  dropTarget.value?.slotPointer === slotPointer && dropTarget.value.index === index;
</script>

<template>
  <template v-for="(child, index) of children" :key="child.props.id">
    <ResourceSurveyCreatorCanvasPreview v-if="previewNode && isPreviewAt(index)" :node="previewNode" />
    <ResourceSurveyCreatorCanvasNode :node="child" :pointer="`${slotPointer}/${index}`" />
  </template>
  <ResourceSurveyCreatorCanvasPreview v-if="previewNode && isPreviewAt(children.length)" :node="previewNode" />
</template>
