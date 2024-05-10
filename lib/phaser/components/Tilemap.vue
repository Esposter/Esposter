<script setup lang="ts">
import { TilemapKey } from "@/generated/tiled/propertyTypes/enum/TilemapKey";
import { useInjectSceneKey } from "@/lib/phaser/composables/useInjectSceneKey";
import { onCreate } from "@/lib/phaser/hooks/onCreate";
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
  tilemap.value.destroy();
  tilemap.value = newScene.make.tilemap({ key: TilemapKey.HomeBuilding1 });
  onComplete?.(newScene, tilemap.value);
});

// watch(
//   () => configuration.key,
//   (newKey) => {
//     const scene = getScene(sceneKey);
//     const oldTilemap = tilemap.value;

//     if (newKey) {
//       tilemap.value = scene.make.tilemap(configuration);
//       onComplete?.(scene, tilemap.value);
//     } else tilemap.value = undefined;

//     if (oldTilemap) oldTilemap.destroy();
//   },
// );

onUnmounted(() => {
  if (!tilemap.value) return;
  tilemap.value.destroy();
});
</script>

<template>
  <slot />
</template>
