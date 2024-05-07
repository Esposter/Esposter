<script setup lang="ts">
import { onCreate } from "@/lib/phaser/hooks/onCreate";
import { onShutdown } from "@/lib/phaser/hooks/onShutdown";
import type { SceneWithPlugins } from "@/models/dungeons/scene/SceneWithPlugins";
import type { Tilemaps, Types } from "phaser";

interface TilemapProps {
  configuration: Types.Tilemaps.TilemapConfig;
  onComplete?: (scene: SceneWithPlugins, tilemap: Tilemaps.Tilemap) => void;
}

defineSlots<{ default: (props: Record<string, never>) => unknown }>();
const { configuration, onComplete } = defineProps<TilemapProps>();
const scene = ref() as Ref<SceneWithPlugins>;
const tilemap = ref<Tilemaps.Tilemap>();

onCreate((newScene) => {
  scene.value = newScene;
  tilemap.value = scene.value.make.tilemap(configuration);
  onComplete?.(scene.value, tilemap.value);
});

onShutdown(() => {
  if (!tilemap.value) return;
  tilemap.value.destroy();
});

watch(
  () => configuration.key,
  (newKey) => {
    const oldTilemap = tilemap.value;

    if (newKey) {
      tilemap.value = scene.value.make.tilemap(configuration);
      onComplete?.(scene.value, tilemap.value);
    } else tilemap.value = undefined;

    if (oldTilemap) oldTilemap.destroy();
  },
);
</script>

<template>
  <slot />
</template>
