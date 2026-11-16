<script setup lang="ts">
import type { VideoConfiguration } from "#src/models/configuration/VideoConfiguration";
import type { VideoEventEmitsOptions } from "#src/models/emit/VideoEventEmitsOptions";
import type { SceneWithPlugins } from "#src/models/scene/SceneWithPlugins";
import type { GameObjects } from "phaser";
import type { UndefinedOnPartial } from "type-fest";

import { useInitializeGameObject } from "#src/composables/useInitializeGameObject";
import { VideoSetterMap } from "#src/services/setterMap/VideoSetterMap";

interface Props {
  configuration: UndefinedOnPartial<Partial<VideoConfiguration>>;
  immediate?: true | undefined;
  onComplete?: ((scene: SceneWithPlugins, video: GameObjects.Video) => void) | undefined;
}

interface VideoEmits extends /** @vue-ignore */ VideoEventEmitsOptions {}

const { configuration, immediate, onComplete } = defineProps<Props>();
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
