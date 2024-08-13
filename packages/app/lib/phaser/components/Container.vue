<script setup lang="ts">
import type { ContainerConfiguration } from "@/lib/phaser/models/configuration/ContainerConfiguration";
import type { ContainerEventEmitsOptions } from "@/lib/phaser/models/emit/ContainerEventEmitsOptions";
import type { GameObjects } from "phaser";

import { useInitializeGameObject } from "@/lib/phaser/composables/useInitializeGameObject";
import { InjectionKeyMap } from "@/lib/phaser/util/InjectionKeyMap";
import { ContainerSetterMap } from "@/lib/phaser/util/setterMap/ContainerSetterMap";

interface ContainerProps {
  configuration?: Partial<ContainerConfiguration>;
}

interface ContainerEmits extends /** @vue-ignore */ ContainerEventEmitsOptions {}

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
