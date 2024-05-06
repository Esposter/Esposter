<script setup lang="ts">
import { useInjectScene } from "@/lib/phaser/composables/useInjectScene";
import type { Tilemaps, Types } from "phaser";

interface TilemapProps {
  configuration: Types.Tilemaps.TilemapConfig;
  onComplete?: (scene: ReturnType<typeof useInjectScene>, tilemap: Tilemaps.Tilemap) => void;
}

defineSlots<{ default: (props: Record<string, never>) => unknown }>();
const { configuration, onComplete } = defineProps<TilemapProps>();
const scene = useInjectScene();
const tilemap = ref(scene.make.tilemap(configuration)) as Ref<Tilemaps.Tilemap>;

watch(
  () => configuration.key,
  (newKey) => {
    const oldTilemap = tilemap.value;
    if (newKey) {
      tilemap.value = scene.make.tilemap(configuration);
      onComplete?.(scene, tilemap.value);
    }
    oldTilemap.destroy();
  },
);
</script>

<template>
  <slot />
</template>
