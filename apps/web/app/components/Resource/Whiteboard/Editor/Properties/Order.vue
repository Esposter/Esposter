<script setup lang="ts">
import { useWhiteboardSelectionOperations } from "#src/composables/whiteboard/useWhiteboardSelectionOperations";
import { WHITEBOARD_STACK_ITEMS } from "#src/services/whiteboard/arrange/constants";
import { getStackOperations } from "#src/services/whiteboard/arrange/getStackOperations";

// The stacking of the selection, which is the one element when one is selected: one step forward or back, or to the front or the back. Each is one
// Commit, so one undo step, and each is disabled when the selection cannot move that way
const { checkIsDisabled: isStackDisabled, commit: stack } = useWhiteboardSelectionOperations(getStackOperations);
</script>

<template>
  <div flex gap-1>
    <UiIconButton
      v-for="{ label, meaning, move } in WHITEBOARD_STACK_ITEMS"
      :key="move"
      :disabled="isStackDisabled(move)"
      :label
      :meaning
      @click="stack(move)"
    />
  </div>
</template>
