<script setup lang="ts">
import { phaserEventEmitter } from "@/lib/phaser/events/phaser";
import { usePhaserStore } from "@/lib/phaser/store/phaser";
import { Game, type Types } from "phaser";

interface GameProps {
  configuration: Types.Core.GameConfig;
}

defineSlots<{ default: (props: Record<string, never>) => unknown }>();
const { configuration } = defineProps<GameProps>();
const phaserStore = usePhaserStore();
const { game, sceneKey } = storeToRefs(phaserStore);
const canvas = ref<HTMLDivElement>();
const isReady = ref(false);
const listener = () => phaserEventEmitter.emit("resize");

onMounted(() => {
  window.addEventListener("resize", listener);
  game.value = new Game({ ...configuration, parent: canvas.value });
  game.value.events.addListener("ready", () => {
    isReady.value = true;
  });
});

onBeforeUnmount(() => {
  window.removeEventListener("resize", listener);

  if (!game.value) return;
  game.value.destroy(false);
  game.value = null;
});

watch(sceneKey, (newSceneKey) => {
  if (!(game.value && newSceneKey)) return;
  game.value.scene.start(newSceneKey);
});
</script>

<template>
  <div ref="canvas" />
  <slot v-if="isReady" />
</template>
