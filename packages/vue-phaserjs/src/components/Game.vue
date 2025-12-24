<script setup lang="ts">
import type { Types } from "phaser";
import type { Except } from "type-fest";
import type { VNode } from "vue";

import { useGame } from "@/composables/useGame";
import { registerTiledJSONExternalLoader } from "@/plugins/registerTiledJSONExternalLoader";
import { usePhaserStore } from "@/store";
import { Game } from "phaser";

interface GameProps {
  // We're gonna stop people from being stupid and adding scenes like this
  // Because Phaser automatically starts the first scene under-the-hood
  // Which is totally un-obvious and also the correct way of adding scenes
  // Is to use the vue "Scene" Component which is way neater C:
  configuration: Except<Types.Core.GameConfig, "scene">;
}

defineSlots<{ default: () => VNode }>();
const { configuration } = defineProps<GameProps>();
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
  storeGame.value.events.on("ready", readyListener);
});

onUnmounted(() => {
  const game = useGame();
  game.events.off("ready", readyListener);
  game.destroy(true);
  storeGame.value = undefined;
});
</script>

<template>
  <div ref="canvasRoot" />
  <slot v-if="isReady" />
</template>
