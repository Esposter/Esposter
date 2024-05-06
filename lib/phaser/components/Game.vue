<script setup lang="ts">
import { useInjectGame } from "@/lib/phaser/composables/useInjectGame";
import { phaserEventEmitter } from "@/lib/phaser/events/phaser";
import { registerTiledJSONExternalLoader } from "@/lib/phaser/plugins/registerTiledJSONExternalLoader";
import { InjectionKeyMap } from "@/lib/phaser/util/InjectionKeyMap";
import type { Types } from "phaser";
import { Game } from "phaser";
import type { Except } from "type-fest";

interface GameProps {
  // We're gonna stop people from being stupid and adding scenes like this
  // because Phaser automatically starts the first scene under-the-hood
  // which is totally un-obvious and also the correct way of adding scenes
  // is to use the vue "Scene" Component which is way neater C:
  configuration: Except<Types.Core.GameConfig, "scene">;
}

defineSlots<{ default: (props: Record<string, never>) => unknown }>();
const { configuration } = defineProps<GameProps>();
const canvasRoot = ref<HTMLDivElement>();
const isReady = ref(false);

useEventListener("resize", () => phaserEventEmitter.emit("resize"));

const readyListener = () => {
  isReady.value = true;
};

onMounted(() => {
  registerTiledJSONExternalLoader();
  const game = new Game({ ...configuration, parent: canvasRoot.value });
  game.events.on("ready", readyListener);
  provide(InjectionKeyMap.Game, game);
});

onUnmounted(() => {
  const game = useInjectGame();
  game.events.off("ready", readyListener);
  game.destroy(true);
});
</script>

<template>
  <div ref="canvasRoot" />
  <slot v-if="isReady" />
</template>
