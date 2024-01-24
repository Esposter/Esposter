<script setup lang="ts">
import { useInitializeGameObject } from "@/lib/phaser/composables/useInitializeGameObject";
import { type ContainerConfiguration } from "@/lib/phaser/models/configuration/ContainerConfiguration";
import { type ContainerEventEmitsOptions } from "@/lib/phaser/models/emit/ContainerEventEmitsOptions";
import { useParentContainerStore } from "@/lib/phaser/store/parentContainer";
import { usePhaserStore } from "@/lib/phaser/store/phaser";
import { ContainerSetterMap } from "@/lib/phaser/util/setterMap/ContainerSetterMap";

interface ContainerProps {
  configuration: Partial<ContainerConfiguration>;
}

interface ContainerEmits extends /** @vue-ignore */ ContainerEventEmitsOptions {}

defineSlots<{ default: (props: Record<string, never>) => unknown }>();
const props = defineProps<ContainerProps>();
const { configuration } = toRefs(props);
const emit = defineEmits<ContainerEmits>();
const phaserStore = usePhaserStore();
const { scene } = storeToRefs(phaserStore);
const parentContainerStore = useParentContainerStore();
const { parentContainer } = storeToRefs(parentContainerStore);
const container = useInitializeGameObject(
  ({ x, y, children }) => scene.value.add.container(x, y, children),
  configuration,
  emit,
  ContainerSetterMap,
);
parentContainer.value = container.value;
</script>

<template>
  <slot />
</template>
