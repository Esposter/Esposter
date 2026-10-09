<script setup lang="ts">
import type { CanvasRect } from "#src/models/CanvasRect";
import type { FittedInterfaceRect } from "#src/models/FittedInterfaceRect";

import { GAME_CANVAS_RECT } from "#src/services/constants";
import { toCanvasRect } from "#src/services/toCanvasRect";
import { toCanvasRectStyle } from "#src/services/toCanvasRectStyle";
import { computed } from "vue";

interface Props {
  // The rect of the `GameRect` this piece is drawn in, which the game hangs it under; the canvas's when it is none
  parent?: CanvasRect;
  // The piece's RectTransform as the screen's fit wrote it
  rect: FittedInterfaceRect;
}

const { parent = GAME_CANVAS_RECT, rect } = defineProps<Props>();
const canvasRect = computed(() => toCanvasRect(rect));
// A piece of the game's interface tree, placed by its RectTransform inside its parent's box, or on the canvas when its
// Parent is the canvas's own rect, so a screen's markup nests as the game's tree does. A nested piece takes its parent's
// Resolved rect through the default slot
const style = computed(() => ({
  ...toCanvasRectStyle(canvasRect.value, parent === GAME_CANVAS_RECT),
  scale: rect.scale?.join(" "),
}));
defineSlots<{ default: (props: { rect: CanvasRect }) => unknown }>();
</script>

<template>
  <div :style>
    <slot :rect="canvasRect" />
  </div>
</template>
