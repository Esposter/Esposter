<script setup lang="ts">
import { useInitializeGameObject } from "@/lib/phaser/composables/useInitializeGameObject";
import { InjectionKeyMap } from "@/lib/phaser/models/InjectionKeyMap";
import type { ContainerConfiguration } from "@/lib/phaser/models/configuration/ContainerConfiguration";
import type { ContainerEventEmitsOptions } from "@/lib/phaser/models/emit/ContainerEventEmitsOptions";
import { usePhaserStore } from "@/lib/phaser/store/phaser";
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
const phaserStore = usePhaserStore();
const { scene } = storeToRefs(phaserStore);
const container = ref(scene.value.add.container(x, y, children)) as Ref<GameObjects.Container>;
useInitializeGameObject(container, configuration as Ref<Partial<ContainerConfiguration>>, emit, ContainerSetterMap);
provide(InjectionKeyMap.ParentContainer, container.value);
</script>

<template>
  <slot />
</template>
