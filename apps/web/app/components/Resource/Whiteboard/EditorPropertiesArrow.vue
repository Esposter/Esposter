<script setup lang="ts">
import type { ArrowElement, ArrowheadKind, ArrowPathKind } from "vue-block-editor-headless";

import { WHITEBOARD_ARROWHEAD_ITEMS, WHITEBOARD_PATH_KIND_ITEMS } from "@/services/whiteboard/arrow/constants";
import { WHITEBOARD_DEFAULT_ARROWHEAD } from "@/services/whiteboard/palette/constants";
import { useWhiteboardStore } from "@/store/resource/whiteboard";
import { ArrowEndKey, unbindPositionedArrowEnd } from "vue-block-editor-headless";

interface Props {
  arrow: ArrowElement;
  index: number;
}

// An arrow's route, the arrowhead at each of its ends, and the detach of each end bound to a shape. A detach is one commit. An end's box sets its
// Arrowhead to the default triangle or clears it, and once an end has one, its kind is chosen beside the box
const { index } = defineProps<Props>();
const whiteboardStore = useWhiteboardStore();
const { commitOperations, updateElementProperty } = whiteboardStore;
const { editState } = storeToRefs(whiteboardStore);
const detachEnd = (arrowEndKey: ArrowEndKey) =>
  commitOperations(unbindPositionedArrowEnd(editState.value.document, index, arrowEndKey));
const setArrowhead = (arrowEndKey: ArrowEndKey, arrowhead?: ArrowheadKind) =>
  updateElementProperty(index, { end: arrowEndKey, property: "arrowhead", value: arrowhead });
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
      :model-value="arrow.start.arrowhead !== undefined"
      is-label-shown
      label="Arrowhead at start"
      @update:model-value="
        (isChecked) => setArrowhead(ArrowEndKey.Start, isChecked ? WHITEBOARD_DEFAULT_ARROWHEAD : undefined)
      "
    />
    <UiToggleGroup
      v-if="arrow.start.arrowhead !== undefined"
      :model-value="arrow.start.arrowhead"
      label="Start head"
      :items="WHITEBOARD_ARROWHEAD_ITEMS"
      @update:model-value="(arrowhead) => setArrowhead(ArrowEndKey.Start, arrowhead)"
    />
    <UiCheckbox
      :model-value="arrow.end.arrowhead !== undefined"
      is-label-shown
      label="Arrowhead at end"
      @update:model-value="
        (isChecked) => setArrowhead(ArrowEndKey.End, isChecked ? WHITEBOARD_DEFAULT_ARROWHEAD : undefined)
      "
    />
    <UiToggleGroup
      v-if="arrow.end.arrowhead !== undefined"
      :model-value="arrow.end.arrowhead"
      label="End head"
      :items="WHITEBOARD_ARROWHEAD_ITEMS"
      @update:model-value="(arrowhead) => setArrowhead(ArrowEndKey.End, arrowhead)"
    />
    <UiButton v-if="arrow.start.binding" @click="detachEnd(ArrowEndKey.Start)">Detach start</UiButton>
    <UiButton v-if="arrow.end.binding" @click="detachEnd(ArrowEndKey.End)">Detach end</UiButton>
  </div>
</template>
