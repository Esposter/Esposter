<script setup lang="ts">
import { UiIconMeaning } from "@/models/ui/UiIconMeaning";
import { useWhiteboardStore } from "@/store/resource/whiteboard";
import { changePositionedElementZOrder } from "headless-block-editor";

interface Props {
  index: number;
}

// The stacking of the selected element: one step forward or back, or to the front or the back. Each is one commit, so one undo step
const { index } = defineProps<Props>();
const whiteboardStore = useWhiteboardStore();
const { commitOperations } = whiteboardStore;
const { whiteboard } = storeToRefs(whiteboardStore);
const lastIndex = computed(() => whiteboard.value.elements.length - 1);
const changeZOrder = (toIndex: number) => {
  commitOperations(changePositionedElementZOrder(whiteboard.value, index, toIndex));
};
</script>

<template>
  <div flex gap-1>
    <UiIconButton
      label="Send to back"
      :meaning="UiIconMeaning.SendToBack"
      :disabled="index === 0"
      @click="changeZOrder(0)"
    />
    <UiIconButton
      label="Send backward"
      :meaning="UiIconMeaning.SendBackward"
      :disabled="index === 0"
      @click="changeZOrder(index - 1)"
    />
    <UiIconButton
      label="Bring forward"
      :meaning="UiIconMeaning.BringForward"
      :disabled="index === lastIndex"
      @click="changeZOrder(index + 1)"
    />
    <UiIconButton
      label="Bring to front"
      :meaning="UiIconMeaning.BringToFront"
      :disabled="index === lastIndex"
      @click="changeZOrder(lastIndex)"
    />
  </div>
</template>
