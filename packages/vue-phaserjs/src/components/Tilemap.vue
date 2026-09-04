<script setup lang="ts">
import type { SceneWithPlugins } from "#src/models/scene/SceneWithPlugins";
import type { Tilemaps, Types } from "phaser";
import type { VNode } from "vue";

import { useInjectSceneKey } from "#src/composables/useInjectSceneKey";
import { onCreate } from "#src/hooks/onCreate";
import { getScene } from "#src/util/getScene";

interface Props {
  configuration: Types.Tilemaps.TilemapConfig;
  onComplete?: (scene: SceneWithPlugins, tilemap: Tilemaps.Tilemap) => void;
}

defineSlots<{ default: () => VNode }>();
const { configuration, onComplete } = defineProps<Props>();
const sceneKey = useInjectSceneKey();
const tilemap = ref<Tilemaps.Tilemap>();

onCreate((newScene) => {
  tilemap.value = newScene.make.tilemap(configuration);
  onComplete?.(newScene, tilemap.value);
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

onUnmounted(() => {
  if (!tilemap.value) return;
  tilemap.value.destroy();
});
</script>

<template>
  <slot />
</template>
