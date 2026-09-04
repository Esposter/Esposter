<script setup lang="ts">
import type { PathFollowerConfiguration } from "#src/models/configuration/PathFollowerConfiguration";
import type { PathFollowerEventEmitsOptions } from "#src/models/emit/PathFollowerEventEmitsOptions";
import type { SceneWithPlugins } from "#src/models/scene/SceneWithPlugins";
import type { GameObjects } from "phaser";
import type { SetRequired } from "type-fest";

import { useInitializeGameObject } from "#src/composables/useInitializeGameObject";
import { PathFollowerSetterMap } from "#src/util/setterMap/PathFollowerSetterMap";

interface PathFollowerEmits extends /** @vue-ignore */ PathFollowerEventEmitsOptions {}

interface Props {
  configuration: SetRequired<Partial<PathFollowerConfiguration>, "path" | "texture">;
  onComplete?: (scene: SceneWithPlugins, pathFollower: GameObjects.PathFollower) => void;
}

const { configuration, onComplete } = defineProps<Props>();
const emit = defineEmits<PathFollowerEmits>();

useInitializeGameObject(
  (scene) => {
    const { frame, path, texture, x, y } = configuration;
    const pathFollower = scene.add.follower(path, x ?? 0, y ?? 0, texture, frame);
    onComplete?.(scene, pathFollower);
    return pathFollower;
  },
  () => configuration,
  emit,
  PathFollowerSetterMap,
);
</script>

<template></template>
