<script setup lang="ts">
import type { ContainerConfiguration } from "@/models/configuration/ContainerConfiguration";
import type { ContainerEventEmitsOptions } from "@/models/emit/ContainerEventEmitsOptions";
import type { GameObjects } from "phaser";

import { useInitializeGameObject } from "@/composables/useInitializeGameObject";
import { InjectionKeyMap } from "@/utils/InjectionKeyMap";
import { ContainerSetterMap } from "@/utils/setterMap/ContainerSetterMap";

interface ContainerEmits extends /** @vue-ignore */ ContainerEventEmitsOptions {}

interface ContainerProps {
  configuration?: Partial<ContainerConfiguration>;
}

defineSlots<{ default: (props: Record<string, never>) => unknown }>();
const { configuration = {} } = defineProps<ContainerProps>();
const emit = defineEmits<ContainerEmits>();
const container = ref<GameObjects.Container>();

useInitializeGameObject(
  (scene) => {
    const { children, x, y } = configuration;
    container.value = scene.add.container(x, y, children);
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
