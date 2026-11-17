<script setup lang="ts">
import type { SurveyPlaceableNode } from "vue-survey-engine-headless";

import { useSurveyCreatorCommands } from "#src/composables/survey/useSurveyCreatorCommands";
import { UiIconMeaning } from "#src/models/ui/UiIconMeaning";
import { getSurveyFieldNode } from "#src/services/resource/survey/getSurveyFieldNode";
import { useSurveyCreatorStore } from "#src/store/survey/creator";
import { checkIsSurveyAnsweringNode, SurveyNodeType } from "vue-survey-engine-headless";

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
const { updateNodeProps } = useSurveyCreatorCommands();
const isSelected = computed(() => selectedPointer.value === pointer);
// A selected choice question edits its choices in the surface's own rows, so its field is not drawn
const choices = computed(() => ("choices" in node.props ? node.props.choices : undefined));
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
    <template v-else>
      <template v-if="isSelected && checkIsSurveyAnsweringNode(node)">
        <ResourceSurveyCreatorCanvasEditableText
          :model-value="node.props.title"
          label="Title"
          @update:model-value="(title) => updateNodeProps(pointer, { title })"
        />
        <ResourceSurveyCreatorCanvasEditableText
          :model-value="node.props.description"
          label="Description"
          @update:model-value="(description) => updateNodeProps(pointer, { description })"
        />
      </template>
      <ResourceSurveyCreatorCanvasEditableChoices v-if="isSelected && choices" :choices :pointer />
      <div v-else pointer-events-none>
        <ResourceSurveyField error="" :node="isSelected ? getSurveyFieldNode(node) : node" seed="" is-disabled />
      </div>
    </template>
    <ResourceSurveyCreatorCanvasAdorner v-if="isSelected" :node :pointer />
    <!-- The handle is drawn on the selected element only, and touch-none keeps a finger on it from scrolling the canvas -->
    <UiIconButton
      v-if="isSelected"
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
