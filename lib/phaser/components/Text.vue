<script setup lang="ts">
import { useWatchProps } from "@/lib/phaser/composables/useWatchProps";
import { TextSetterMap } from "@/lib/phaser/services/setterMap/TextSetterMap";
import { usePhaserStore } from "@/lib/phaser/store/phaser";
import { type Types } from "phaser";

interface TextProps {
  configuration: Types.GameObjects.Text.TextConfig;
}

const props = defineProps<TextProps>();
const { configuration } = toRefs(props);
const phaserStore = usePhaserStore();
const { gameObjectCreator } = storeToRefs(phaserStore);
const text = gameObjectCreator.value.text(configuration.value);
defineExpose(text);

useWatchProps(text, configuration, TextSetterMap);

onBeforeUnmount(() => {
  text.destroy();
});
</script>

<template>
  <slot />
</template>
