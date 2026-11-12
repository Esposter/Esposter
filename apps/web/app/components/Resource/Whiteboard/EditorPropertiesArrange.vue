<script setup lang="ts">
import { UiIconMeaning } from "@/models/ui/UiIconMeaning";
import { AlignEdge } from "@/models/whiteboard/AlignEdge";
import { DistributeAxis } from "@/models/whiteboard/DistributeAxis";
import {
  WHITEBOARD_ALIGN_MINIMUM_BOXES,
  WHITEBOARD_DISTRIBUTE_MINIMUM_BOXES,
} from "@/services/whiteboard/arrange/constants";
import { getAlignOperations } from "@/services/whiteboard/arrange/getAlignOperations";
import { getDistributeOperations } from "@/services/whiteboard/arrange/getDistributeOperations";
import { getSelectedBoxes } from "@/services/whiteboard/arrange/getSelectedBoxes";
import { useWhiteboardStore } from "@/store/resource/whiteboard";
import { useWhiteboardEditorStore } from "@/store/resource/whiteboard/editor";

// The align and distribute controls of a selection. Each is one commit, so one undo step. Align needs two boxes and distribute three, since an arrow
// And a stroke are not moved by either, so each control is disabled below its minimum number of boxes
const whiteboardStore = useWhiteboardStore();
const { commitOperations } = whiteboardStore;
const { editState } = storeToRefs(whiteboardStore);
const whiteboardEditorStore = useWhiteboardEditorStore();
const { selectedIds } = storeToRefs(whiteboardEditorStore);
const boxCount = computed(() => getSelectedBoxes(editState.value.document, selectedIds.value).length);
const canAlign = computed(() => boxCount.value >= WHITEBOARD_ALIGN_MINIMUM_BOXES);
const canDistribute = computed(() => boxCount.value >= WHITEBOARD_DISTRIBUTE_MINIMUM_BOXES);
const align = (edge: AlignEdge) => {
  commitOperations(getAlignOperations(editState.value.document, selectedIds.value, edge));
};
const distribute = (axis: DistributeAxis) => {
  commitOperations(getDistributeOperations(editState.value.document, selectedIds.value, axis));
};
</script>

<template>
  <div flex flex-col gap-1>
    <div flex gap-1>
      <UiIconButton
        label="Align left"
        :meaning="UiIconMeaning.AlignLeft"
        :disabled="!canAlign"
        @click="align(AlignEdge.Left)"
      />
      <UiIconButton
        label="Align centre"
        :meaning="UiIconMeaning.AlignCentre"
        :disabled="!canAlign"
        @click="align(AlignEdge.Centre)"
      />
      <UiIconButton
        label="Align right"
        :meaning="UiIconMeaning.AlignRight"
        :disabled="!canAlign"
        @click="align(AlignEdge.Right)"
      />
      <UiIconButton
        label="Align top"
        :meaning="UiIconMeaning.AlignTop"
        :disabled="!canAlign"
        @click="align(AlignEdge.Top)"
      />
      <UiIconButton
        label="Align middle"
        :meaning="UiIconMeaning.AlignMiddle"
        :disabled="!canAlign"
        @click="align(AlignEdge.Middle)"
      />
      <UiIconButton
        label="Align bottom"
        :meaning="UiIconMeaning.AlignBottom"
        :disabled="!canAlign"
        @click="align(AlignEdge.Bottom)"
      />
    </div>
    <div flex gap-1>
      <UiIconButton
        label="Distribute horizontally"
        :meaning="UiIconMeaning.DistributeHorizontally"
        :disabled="!canDistribute"
        @click="distribute(DistributeAxis.Horizontal)"
      />
      <UiIconButton
        label="Distribute vertically"
        :meaning="UiIconMeaning.DistributeVertically"
        :disabled="!canDistribute"
        @click="distribute(DistributeAxis.Vertical)"
      />
    </div>
  </div>
</template>
