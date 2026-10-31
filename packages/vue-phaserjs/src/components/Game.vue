<script setup lang="ts">
import type { Types } from "phaser";
import type { Except } from "type-fest";
import type { VNode } from "vue";

import { useGame } from "#src/composables/useGame";
import { registerTiledJSONExternalLoader } from "#src/plugins/registerTiledJSONExternalLoader";
import { usePhaserStore } from "#src/store/index";
import { Core, Game } from "phaser";

interface Props {
  // `scene` is excluded because Phaser silently starts the first scene it is handed, bypassing the `Scene`
  // Component's lifecycle — scenes are added through that component instead
  configuration: Except<Types.Core.GameConfig, "scene">;
}

defineSlots<{ default: () => VNode }>();
const { configuration } = defineProps<Props>();
const phaserStore = usePhaserStore();
const { game: storeGame } = storeToRefs(phaserStore);
const canvasRoot = useTemplateRef("canvasRoot");
const isReady = ref(false);

const readyListener = () => {
  isReady.value = true;
};

onMounted(() => {
  registerTiledJSONExternalLoader();
  storeGame.value = new Game({ ...configuration, parent: canvasRoot.value });
  storeGame.value.events.on(Core.Events.READY, readyListener);
});

onUnmounted(() => {
  const game = useGame();
  game.events.off(Core.Events.READY, readyListener);
  game.destroy(true);
  storeGame.value = undefined;
});
</script>

<template>
  <div ref="canvasRoot" />
  <slot v-if="isReady" />
</template>
