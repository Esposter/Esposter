<script setup lang="ts">
import { phaserEventEmitter } from "@/lib/phaser/events/phaser";
import { usePhaserStore } from "@/lib/phaser/store/phaser";
import { type Except } from "@/util/types/Except";
import { Game, type Types } from "phaser";

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
const { game } = storeToRefs(phaserStore);
const canvasRoot = ref<HTMLDivElement>();
const isReady = ref(false);

useEventListener("resize", () => phaserEventEmitter.emit("resize"));

onMounted(() => {
  game.value = new Game({ ...configuration, parent: canvasRoot.value });
  game.value.events.addListener("ready", () => {
    isReady.value = true;
  });
});

onUnmounted(() => {
  if (!game.value) return;
  game.value.destroy(true);
  game.value = null;
});
</script>

<template>
  <div ref="canvasRoot" />
  <slot v-if="isReady" />
</template>
