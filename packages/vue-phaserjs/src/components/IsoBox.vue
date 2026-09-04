<script setup lang="ts">
import type { IsoBoxConfiguration } from "#src/models/configuration/IsoBoxConfiguration";
import type { IsoBoxEventEmitsOptions } from "#src/models/emit/IsoBoxEventEmitsOptions";
import type { SceneWithPlugins } from "#src/models/scene/SceneWithPlugins";
import type { GameObjects } from "phaser";

import { useInitializeGameObject } from "#src/composables/useInitializeGameObject";
import { IsoBoxSetterMap } from "#src/util/setterMap/IsoBoxSetterMap";

interface IsoBoxEmits extends /** @vue-ignore */ IsoBoxEventEmitsOptions {}

interface Props {
  configuration: Partial<IsoBoxConfiguration>;
  immediate?: true;
  onComplete?: (scene: SceneWithPlugins, isoBox: GameObjects.IsoBox) => void;
}

const { configuration, immediate, onComplete } = defineProps<Props>();
const emit = defineEmits<IsoBoxEmits>();

useInitializeGameObject(
  (scene) => {
    const { fillLeft, fillRight, fillTop, height, size, x, y } = configuration;
    const isoBox = scene.add.isobox(x, y, size, height, fillTop, fillLeft, fillRight);
    onComplete?.(scene, isoBox);
    return isoBox;
  },
  () => configuration,
  emit,
  IsoBoxSetterMap,
  immediate,
);
</script>

<template></template>
