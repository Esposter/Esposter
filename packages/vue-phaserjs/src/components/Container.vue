<script setup lang="ts">
import type { ContainerConfiguration } from "#src/models/configuration/ContainerConfiguration";
import type { ContainerEventEmitsOptions } from "#src/models/emit/ContainerEventEmitsOptions";
import type { SceneWithPlugins } from "#src/models/scene/SceneWithPlugins";
import type { GameObjects } from "phaser";
import type { VNode } from "vue";

import { useInitializeGameObject } from "#src/composables/useInitializeGameObject";
import { ContainerSetterMap } from "#src/services/setterMap/ContainerSetterMap";
import { InjectionKeyMap } from "#src/services/shared/InjectionKeyMap";

interface ContainerEmits extends /** @vue-ignore */ ContainerEventEmitsOptions {}

interface Props {
  configuration?: Partial<ContainerConfiguration>;
  onComplete?: (scene: SceneWithPlugins, container: GameObjects.Container) => void;
}

defineSlots<{ default: () => VNode }>();
const { configuration = {}, onComplete } = defineProps<Props>();
const emit = defineEmits<ContainerEmits>();
const container = shallowRef<GameObjects.Container>();

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

// oxlint-disable-next-line no-restricted-globals -- a Container's game objects are the subtree it renders
provide(InjectionKeyMap.ParentContainer, container);
</script>

<template>
  <slot />
</template>
