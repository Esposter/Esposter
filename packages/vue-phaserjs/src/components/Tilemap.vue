<script setup lang="ts">
import type { SceneWithPlugins } from "#src/models/scene/SceneWithPlugins";
import type { Tilemaps, Types } from "phaser";
import type { VNode } from "vue";

import { useInjectSceneKey } from "#src/composables/useInjectSceneKey";
import { getInitializeGameObjectLifecycleHook } from "#src/services/hooks/getInitializeGameObjectLifecycleHook";
import { getScene } from "#src/services/shared/getScene";

interface Props {
  configuration: Types.Tilemaps.TilemapConfig;
  onComplete?: (scene: SceneWithPlugins, tilemap: Tilemaps.Tilemap) => void;
}

defineSlots<{ default: () => VNode }>();
const { configuration, onComplete } = defineProps<Props>();
const sceneKey = useInjectSceneKey();
const tilemap = shallowRef<Tilemaps.Tilemap>();
const lifecycleHook = getInitializeGameObjectLifecycleHook(sceneKey);

// Every build goes through here, so the tilemap it replaces is destroyed rather than left in the scene
const createTilemap = (scene: SceneWithPlugins) => {
  tilemap.value?.destroy();
  tilemap.value = scene.make.tilemap(configuration);
  onComplete?.(scene, tilemap.value);
};

lifecycleHook(createTilemap);

watch(
  () => configuration.key,
  (newKey) => {
    if (newKey) createTilemap(getScene(sceneKey));
    else {
      tilemap.value?.destroy();
      tilemap.value = undefined;
    }
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
