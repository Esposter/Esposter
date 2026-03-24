<script setup lang="ts">
import type { ContainerConfiguration } from "@/models/configuration/ContainerConfiguration";
import type { ContainerEventEmitsOptions } from "@/models/emit/ContainerEventEmitsOptions";
import type { SceneWithPlugins } from "@/models/scene/SceneWithPlugins";
import type { GameObjects } from "phaser";
import type { VNode } from "vue";

import { useInitializeGameObject } from "@/composables/useInitializeGameObject";
import { InjectionKeyMap } from "@/util/InjectionKeyMap";
import { ContainerSetterMap } from "@/util/setterMap/ContainerSetterMap";

interface ContainerEmits  extends /** @vue-ignore */ ContainerEventEmitsOptions {}

interface ContainerProps {
  configuration?: Partial<ContainerConfiguration>;
  onComplete?: (scene: SceneWithPlugins, container: GameObjects.Container) => void;
}

defineSlots<{ default: () => VNode }>();
const { configuration = {}, onComplete } = defineProps<ContainerProps>();
const emit = defineEmits<ContainerEmits>();
const container = ref<GameObjects.Container>();

useInitializeGameObject(
  (scene) => {
    const { children, x, y } = configuration;
    container.value = scene.add.container(x, y, children);
    onComplete?.(scene, container.value);
    return container.value;
  },
  () => configuration,
  emit,
  ContainerSetterMap,
);

provide(InjectionKeyMap.ParentContainer, container);
</script>

<template>
  <slot />
</template>
