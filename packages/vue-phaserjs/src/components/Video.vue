<script setup lang="ts">
import type { VideoConfiguration } from "@/models/configuration/VideoConfiguration";
import type { VideoEventEmitsOptions } from "@/models/emit/VideoEventEmitsOptions";
import type { SceneWithPlugins } from "@/models/scene/SceneWithPlugins";
import type { GameObjects } from "phaser";

import { useInitializeGameObject } from "@/composables/useInitializeGameObject";
import { VideoSetterMap } from "@/util/setterMap/VideoSetterMap";

interface VideoEmits extends /** @vue-ignore */ VideoEventEmitsOptions {}

interface VideoProps {
  configuration: Partial<VideoConfiguration>;
  immediate?: true;
  onComplete?: (scene: SceneWithPlugins, video: GameObjects.Video) => void;
}

const { configuration, immediate, onComplete } = defineProps<VideoProps>();
const emit = defineEmits<VideoEmits>();

useInitializeGameObject(
  (scene) => {
    const { key, x, y } = configuration;
    const video = scene.add.video(x ?? 0, y ?? 0, key);
    onComplete?.(scene, video);
    return video;
  },
  () => configuration,
  emit,
  VideoSetterMap,
  immediate,
);
</script>

<template></template>
