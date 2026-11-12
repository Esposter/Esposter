<script setup lang="ts">
import { UiIconMeaning } from "@/models/ui/UiIconMeaning";
import { AlignEdge } from "@/models/whiteboard/AlignEdge";
import { DistributeAxis } from "@/models/whiteboard/DistributeAxis";
import { getAlignOperations } from "@/services/whiteboard/arrange/getAlignOperations";
import { getDistributeOperations } from "@/services/whiteboard/arrange/getDistributeOperations";
import { useWhiteboardStore } from "@/store/resource/whiteboard";
import { useWhiteboardEditorStore } from "@/store/resource/whiteboard/editor";

// The align and distribute controls of a selection. Each is one commit, so one undo step, and each is disabled when it would move nothing: below its
// Minimum number of boxes, since an arrow and a stroke are not moved by either, or when the boxes already lie as it would put them
const whiteboardStore = useWhiteboardStore();
const { commitOperations } = whiteboardStore;
const { editState } = storeToRefs(whiteboardStore);
const whiteboardEditorStore = useWhiteboardEditorStore();
const { selectedIds } = storeToRefs(whiteboardEditorStore);
const checkIsAlignDisabled = (edge: AlignEdge) =>
  getAlignOperations(editState.value.document, selectedIds.value, edge).length === 0;
const checkIsDistributeDisabled = (axis: DistributeAxis) =>
  getDistributeOperations(editState.value.document, selectedIds.value, axis).length === 0;
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
        :disabled="checkIsAlignDisabled(AlignEdge.Left)"
        @click="align(AlignEdge.Left)"
      />
      <UiIconButton
        label="Align centre"
        :meaning="UiIconMeaning.AlignCentre"
        :disabled="checkIsAlignDisabled(AlignEdge.Centre)"
        @click="align(AlignEdge.Centre)"
      />
      <UiIconButton
        label="Align right"
        :meaning="UiIconMeaning.AlignRight"
        :disabled="checkIsAlignDisabled(AlignEdge.Right)"
        @click="align(AlignEdge.Right)"
      />
      <UiIconButton
        label="Align top"
        :meaning="UiIconMeaning.AlignTop"
        :disabled="checkIsAlignDisabled(AlignEdge.Top)"
        @click="align(AlignEdge.Top)"
      />
      <UiIconButton
        label="Align middle"
        :meaning="UiIconMeaning.AlignMiddle"
        :disabled="checkIsAlignDisabled(AlignEdge.Middle)"
        @click="align(AlignEdge.Middle)"
      />
      <UiIconButton
        label="Align bottom"
        :meaning="UiIconMeaning.AlignBottom"
        :disabled="checkIsAlignDisabled(AlignEdge.Bottom)"
        @click="align(AlignEdge.Bottom)"
      />
    </div>
    <div flex gap-1>
      <UiIconButton
        label="Distribute horizontally"
        :meaning="UiIconMeaning.DistributeHorizontally"
        :disabled="checkIsDistributeDisabled(DistributeAxis.Horizontal)"
        @click="distribute(DistributeAxis.Horizontal)"
      />
      <UiIconButton
        label="Distribute vertically"
        :meaning="UiIconMeaning.DistributeVertically"
        :disabled="checkIsDistributeDisabled(DistributeAxis.Vertical)"
        @click="distribute(DistributeAxis.Vertical)"
      />
    </div>
  </div>
</template>
