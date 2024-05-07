<script setup lang="ts">
import { useInjectSceneKey } from "@/lib/phaser/composables/useInjectSceneKey";
import { onCreate } from "@/lib/phaser/hooks/onCreate";
import { onShutdown } from "@/lib/phaser/hooks/onShutdown";
import { getScene } from "@/lib/phaser/util/getScene";
import type { SceneWithPlugins } from "@/models/dungeons/scene/SceneWithPlugins";
import type { Tilemaps, Types } from "phaser";

interface TilemapProps {
  configuration: Types.Tilemaps.TilemapConfig;
  onComplete?: (scene: SceneWithPlugins, tilemap: Tilemaps.Tilemap) => void;
}

defineSlots<{ default: (props: Record<string, never>) => unknown }>();
const { configuration, onComplete } = defineProps<TilemapProps>();
const sceneKey = useInjectSceneKey();
const tilemap = ref<Tilemaps.Tilemap>();

onCreate((newScene) => {
  tilemap.value = newScene.make.tilemap(configuration);
  onComplete?.(newScene, tilemap.value);
});

onShutdown(() => {
  if (!tilemap.value) return;
  tilemap.value.destroy();
});

watch(
  () => configuration.key,
  (newKey) => {
    const scene = getScene(sceneKey);
    const oldTilemap = tilemap.value;

    if (newKey) {
      tilemap.value = scene.make.tilemap(configuration);
      onComplete?.(scene, tilemap.value);
    } else tilemap.value = undefined;

    if (oldTilemap) oldTilemap.destroy();
  },
);
</script>

<template>
  <slot />
</template>
