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
const tilemap = ref<Tilemaps.Tilemap>();

watch(
  () => configuration.key,
  () => {
    if (tilemap.value) tilemap.value.destroy();
    tilemap.value = scene.make.tilemap(configuration);
    onComplete?.(scene, tilemap.value);
  },
  { immediate: true },
);
</script>

<template>
  <slot />
</template>
