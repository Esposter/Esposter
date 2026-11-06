<script setup lang="ts">
import type { SurveyPlaceableNode } from "vue-survey-engine-headless";

import { UiIconMeaning } from "@/models/ui/UiIconMeaning";
import { useSurveyCreatorStore } from "@/store/survey/creator";
import { SurveyNodeType } from "vue-survey-engine-headless";

interface Props {
  // The question or panel drawn here, which a page or a panel holds
  node: SurveyPlaceableNode;
  // Where the node sits in the document, which is what choosing it selects
  pointer: string;
}

const { node, pointer } = defineProps<Props>();
const surveyCreatorStore = useSurveyCreatorStore();
const { selectedPointer } = storeToRefs(surveyCreatorStore);
const { getSelectionBindings } = useSurveyCanvasSelection();
const { startNodeDrag } = useSurveyCreatorDrag();
</script>

<template>
  <!-- A question is drawn by its field with the pointer events off, so a click lands on this element and selects it -->
  <div
    :="getSelectionBindings(pointer)"
    rd="[--ui-container-radius]"
    tabindex="0"
    data-survey-child="true"
    ui-ring-outside
    relative
  >
    <div
      v-if="node.type === SurveyNodeType.Panel"
      :data-survey-slot="`${pointer}/props/children`"
      p-3
      b-border
      rd="[--ui-container-radius]"
      flex
      flex-col
      gap-3
    >
      <h3 v-if="node.props.title" ui-title>{{ node.props.title }}</h3>
      <ResourceSurveyCreatorCanvasSlot :children="node.props.children" :slot-pointer="`${pointer}/props/children`" />
    </div>
    <div v-else pointer-events-none>
      <ResourceSurveyField error="" :node seed="" is-disabled />
    </div>
    <!-- The handle is drawn on the selected element only, and touch-none keeps a finger on it from scrolling the canvas -->
    <UiIconButton
      v-if="selectedPointer === pointer"
      cursor-move
      right-0
      top-0
      absolute
      touch-none
      label="Drag"
      :meaning="UiIconMeaning.Drag"
      @pointerdown="(event: PointerEvent) => startNodeDrag(node.props.id, event)"
    />
  </div>
</template>
