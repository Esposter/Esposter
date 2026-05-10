<script setup lang="ts">
import type { IsoBoxConfiguration } from "@/models/configuration/IsoBoxConfiguration";
import type { IsoBoxEventEmitsOptions } from "@/models/emit/IsoBoxEventEmitsOptions";
import type { SceneWithPlugins } from "@/models/scene/SceneWithPlugins";
import type { GameObjects } from "phaser";

import { useInitializeGameObject } from "@/composables/useInitializeGameObject";
import { IsoBoxSetterMap } from "@/util/setterMap/IsoBoxSetterMap";

interface IsoBoxEmits extends /** @vue-ignore */ IsoBoxEventEmitsOptions {}

interface IsoBoxProps {
  configuration: Partial<IsoBoxConfiguration>;
  immediate?: true;
  onComplete?: (scene: SceneWithPlugins, isoBox: GameObjects.IsoBox) => void;
}

const { configuration, immediate, onComplete } = defineProps<IsoBoxProps>();
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
