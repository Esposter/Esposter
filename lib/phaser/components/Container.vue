<script setup lang="ts">
import { useInitializeGameObject } from "@/lib/phaser/composables/useInitializeGameObject";
import type { ContainerConfiguration } from "@/lib/phaser/models/configuration/ContainerConfiguration";
import type { ContainerEventEmitsOptions } from "@/lib/phaser/models/emit/ContainerEventEmitsOptions";
import { InjectionKeyMap } from "@/lib/phaser/util/InjectionKeyMap";
import { ContainerSetterMap } from "@/lib/phaser/util/setterMap/ContainerSetterMap";

interface ContainerProps {
  configuration?: Partial<ContainerConfiguration>;
}

interface ContainerEmits extends /** @vue-ignore */ ContainerEventEmitsOptions {}

defineSlots<{ default: (props: Record<string, never>) => unknown }>();
const { configuration = {} } = defineProps<ContainerProps>();
const emit = defineEmits<ContainerEmits>();

useInitializeGameObject(
  (scene) => {
    const { x, y, children } = configuration;
    const container = scene.add.container(x, y, children);
    provide(InjectionKeyMap.ParentContainer, container);
    return container;
  },
  () => configuration,
  emit,
  ContainerSetterMap,
);
</script>

<template>
  <slot />
</template>
