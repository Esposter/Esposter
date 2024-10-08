<script setup lang="ts">
import type { Types } from "phaser";
import type { Except } from "type-fest";

import { useGame } from "@/composables/useGame";
import { registerTiledJSONExternalLoader } from "@/plugins/registerTiledJSONExternalLoader";
import { usePhaserStore } from "@/store";
import { Game } from "phaser";

interface GameProps {
  // We're gonna stop people from being stupid and adding scenes like this
  // because Phaser automatically starts the first scene under-the-hood
  // which is totally un-obvious and also the correct way of adding scenes
  // is to use the vue "Scene" Component which is way neater C:
  configuration: Except<Types.Core.GameConfig, "scene">;
}

defineSlots<{ default: (props: Record<string, never>) => unknown }>();
const { configuration } = defineProps<GameProps>();
const phaserStore = usePhaserStore();
const { game: storeGame } = storeToRefs(phaserStore);
const canvasRoot = ref<HTMLDivElement>();
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
