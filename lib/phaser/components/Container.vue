<script setup lang="ts">
import { useInitializeGameObject } from "@/lib/phaser/composables/useInitializeGameObject";
import { useInjectScene } from "@/lib/phaser/composables/useInjectScene";
import type { ContainerConfiguration } from "@/lib/phaser/models/configuration/ContainerConfiguration";
import type { ContainerEventEmitsOptions } from "@/lib/phaser/models/emit/ContainerEventEmitsOptions";
import { InjectionKeyMap } from "@/lib/phaser/util/InjectionKeyMap";
import { ContainerSetterMap } from "@/lib/phaser/util/setterMap/ContainerSetterMap";
import type { GameObjects } from "phaser";

interface ContainerProps {
  configuration?: Partial<ContainerConfiguration>;
}

interface ContainerEmits extends /** @vue-ignore */ ContainerEventEmitsOptions {}

defineSlots<{ default: (props: Record<string, never>) => unknown }>();
const props = withDefaults(defineProps<ContainerProps>(), { configuration: () => ({}) });
const { configuration } = toRefs(props);
const { x, y, children } = configuration.value;
const emit = defineEmits<ContainerEmits>();
const scene = useInjectScene();
const container = ref(scene.add.container(x, y, children)) as Ref<GameObjects.Container>;
useInitializeGameObject(container, configuration, emit, ContainerSetterMap);
provide(InjectionKeyMap.ParentContainer, container.value);
</script>

<template>
  <slot />
</template>
