<script setup lang="ts">
import type { FittedInterfaceRect } from "#src/models/FittedInterfaceRect";

import { GameRectKey } from "#src/services/GameRectKey";
import { readCanvasRect } from "#src/services/readCanvasRect";
import { toCanvasRectStyle } from "#src/services/toCanvasRectStyle";

interface Props {
  // The piece's RectTransform as the screen's fit wrote it
  rect: FittedInterfaceRect;
}

const { rect } = defineProps<Props>();
// A piece of the game's interface tree, placed by its RectTransform: inside the nearest `GameRect` it is drawn in, as
// The game hangs it under its parent, or on the canvas when it is drawn in none, so a screen's markup nests as the
// Game's tree does and a parent's place reaches everything in it
// oxlint-disable-next-line no-restricted-globals -- a GameRect places the subtree it draws, as the game hangs a piece under its parent
const isOnCanvas = !inject(GameRectKey, false);
// oxlint-disable-next-line no-restricted-globals -- a GameRect places the subtree it draws, as the game hangs a piece under its parent
provide(GameRectKey, true);
const style = computed(() => ({
  ...toCanvasRectStyle(readCanvasRect(rect), isOnCanvas),
  scale: rect.scale?.join(" "),
}));
</script>

<template>
  <div :style><slot /></div>
</template>
