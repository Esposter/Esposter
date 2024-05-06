<script setup lang="ts">
import { onCreate } from "@/lib/phaser/hooks/onCreate";
import type { SceneWithPlugins } from "@/models/dungeons/scene/SceneWithPlugins";
import type { Tilemaps, Types } from "phaser";

interface TilemapProps {
  configuration: Types.Tilemaps.TilemapConfig;
  onComplete?: (scene: SceneWithPlugins, tilemap: Tilemaps.Tilemap) => void;
}

defineSlots<{ default: (props: Record<string, never>) => unknown }>();
const { configuration, onComplete } = defineProps<TilemapProps>();
const tilemap = ref() as Ref<Tilemaps.Tilemap>;
const scene = ref() as Ref<SceneWithPlugins>;

onCreate((newScene) => {
  tilemap.value = newScene.make.tilemap(configuration);
  onComplete?.(newScene, tilemap.value);
  scene.value = newScene;
});

watch(
  () => configuration.key,
  (newKey) => {
    const oldTilemap = tilemap.value;
    if (newKey) {
      tilemap.value = scene.value.make.tilemap(configuration);
      onComplete?.(scene.value, tilemap.value);
    }
    oldTilemap.destroy();
  },
);
</script>

<template>
  <slot />
</template>
