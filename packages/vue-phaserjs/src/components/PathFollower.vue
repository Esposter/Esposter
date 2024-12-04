<script setup lang="ts">
import type { PathFollowerConfiguration } from "@/models/configuration/PathFollowerConfiguration";
import type { PathFollowerEventEmitsOptions } from "@/models/emit/PathFollowerEventEmitsOptions";
import type { SceneWithPlugins } from "@/models/scene/SceneWithPlugins";
import type { GameObjects } from "phaser";
import type { SetRequired } from "type-fest";

import { useInitializeGameObject } from "@/composables/useInitializeGameObject";
import { PathFollowerSetterMap } from "@/util/setterMap/PathFollowerSetterMap";

export interface PathFollowerProps {
  configuration: SetRequired<Partial<PathFollowerConfiguration>, "path" | "texture">;
  onComplete?: (scene: SceneWithPlugins, pathFollower: GameObjects.PathFollower) => void;
}

interface PathFollowerEmits extends /** @vue-ignore */ PathFollowerEventEmitsOptions {}

const { configuration, onComplete } = defineProps<PathFollowerProps>();
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
