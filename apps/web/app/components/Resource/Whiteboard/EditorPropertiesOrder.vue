<script setup lang="ts">
import { UiIconMeaning } from "@/models/ui/UiIconMeaning";
import { StackMove } from "@/models/whiteboard/StackMove";
import { getStackOperations } from "@/services/whiteboard/arrange/getStackOperations";
import { useWhiteboardStore } from "@/store/resource/whiteboard";
import { useWhiteboardEditorStore } from "@/store/resource/whiteboard/editor";

// The stacking of the selection, which is the one element when one is selected: one step forward or back, or to the front or the back. Each is one
// Commit, so one undo step, and each is disabled when the selection cannot move that way
const whiteboardStore = useWhiteboardStore();
const { commitOperations } = whiteboardStore;
const { editState } = storeToRefs(whiteboardStore);
const whiteboardEditorStore = useWhiteboardEditorStore();
const { selectedIds } = storeToRefs(whiteboardEditorStore);
const getStackMoveOperations = (move: StackMove) =>
  getStackOperations(editState.value.document, selectedIds.value, move);
const isStackDisabled = (move: StackMove) => getStackMoveOperations(move).length === 0;
const stack = (move: StackMove) => {
  commitOperations(getStackMoveOperations(move));
};
</script>

<template>
  <div flex gap-1>
    <UiIconButton
      label="Send to back"
      :meaning="UiIconMeaning.SendToBack"
      :disabled="isStackDisabled(StackMove.SendToBack)"
      @click="stack(StackMove.SendToBack)"
    />
    <UiIconButton
      label="Send backward"
      :meaning="UiIconMeaning.SendBackward"
      :disabled="isStackDisabled(StackMove.SendBackward)"
      @click="stack(StackMove.SendBackward)"
    />
    <UiIconButton
      label="Bring forward"
      :meaning="UiIconMeaning.BringForward"
      :disabled="isStackDisabled(StackMove.BringForward)"
      @click="stack(StackMove.BringForward)"
    />
    <UiIconButton
      label="Bring to front"
      :meaning="UiIconMeaning.BringToFront"
      :disabled="isStackDisabled(StackMove.BringToFront)"
      @click="stack(StackMove.BringToFront)"
    />
  </div>
</template>
