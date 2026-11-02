<script setup lang="ts">
import type { ArrowElement, ArrowPathKind } from "headless-block-editor";

import { WHITEBOARD_PATH_KIND_ITEMS } from "@/services/whiteboard/arrow/constants";
import { useWhiteboardStore } from "@/store/resource/whiteboard";
import { ArrowEndKey, unbindPositionedArrowEnd } from "headless-block-editor";

interface Props {
  arrow: ArrowElement;
  index: number;
}

// An arrow's route, the arrowhead at each of its ends, and the detach of each end bound to a shape. A detach is one commit
const { arrow, index } = defineProps<Props>();
const whiteboardStore = useWhiteboardStore();
const { commitOperations, updateElementProperty } = whiteboardStore;
const detachEnd = (arrowEndKey: ArrowEndKey) =>
  commitOperations(unbindPositionedArrowEnd(whiteboardStore.editState.document, index, arrowEndKey));
</script>

<template>
  <div flex flex-col gap-2>
    <UiSelect
      :model-value="arrow.pathKind"
      label="Route"
      :items="WHITEBOARD_PATH_KIND_ITEMS"
      @update:model-value="
        (pathKind: ArrowPathKind) => updateElementProperty(index, { property: 'pathKind', value: pathKind })
      "
    />
    <UiCheckbox
      :model-value="arrow.start.hasArrowhead"
      is-label-shown
      label="Arrowhead at start"
      @update:model-value="
        (hasArrowhead) =>
          updateElementProperty(index, { end: ArrowEndKey.Start, property: 'hasArrowhead', value: hasArrowhead })
      "
    />
    <UiCheckbox
      :model-value="arrow.end.hasArrowhead"
      is-label-shown
      label="Arrowhead at end"
      @update:model-value="
        (hasArrowhead) =>
          updateElementProperty(index, { end: ArrowEndKey.End, property: 'hasArrowhead', value: hasArrowhead })
      "
    />
    <UiButton v-if="arrow.start.binding" @click="detachEnd(ArrowEndKey.Start)">Detach start</UiButton>
    <UiButton v-if="arrow.end.binding" @click="detachEnd(ArrowEndKey.End)">Detach end</UiButton>
  </div>
</template>
