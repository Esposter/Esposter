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
// Resolved rect through the default slot. A scaled piece scales about its pivot, as Unity scales it, so a piece pivoted
// At a corner keeps that corner where it stands
const style = computed(() => {
  const [pivotX, pivotY] = canvasRect.value.pivot;
  return {
    ...toCanvasRectStyle(canvasRect.value, parent === GAME_CANVAS_RECT),
    scale: rect.scale?.join(" "),
    transformOrigin: `${pivotX * 100}% ${(1 - pivotY) * 100}%`,
  };
});
defineSlots<{ default: (props: { rect: CanvasRect }) => unknown }>();
</script>

<template>
  <div :style>
    <slot :rect="canvasRect" />
  </div>
</template>
