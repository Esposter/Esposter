<script setup lang="ts">
import { useInjectGame } from "@/lib/phaser/composables/useInjectGame";
import { useInjectSceneKey } from "@/lib/phaser/composables/useInjectSceneKey";
import { onCreate } from "@/lib/phaser/hooks/onCreate";
import { getScene } from "@/lib/phaser/util/getScene";
import type { SceneWithPlugins } from "@/models/dungeons/scene/SceneWithPlugins";
import type { Tilemaps, Types } from "phaser";

interface TilemapProps {
  configuration: Types.Tilemaps.TilemapConfig;
  onComplete?: (scene: SceneWithPlugins, tilemap: Tilemaps.Tilemap) => void;
}

defineSlots<{ default: (props: Record<string, never>) => unknown }>();
const { configuration, onComplete } = defineProps<TilemapProps>();
const tilemap = ref() as Ref<Tilemaps.Tilemap>;

onCreate((scene) => {
  tilemap.value = scene.make.tilemap(configuration);
  onComplete?.(scene, tilemap.value);
});

watch(
  () => configuration.key,
  (newKey) => {
    const oldTilemap = tilemap.value;
    if (newKey) {
      const game = useInjectGame();
      const sceneKey = useInjectSceneKey();
      const scene = getScene(game, sceneKey);
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
