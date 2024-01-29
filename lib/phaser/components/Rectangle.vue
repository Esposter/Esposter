<script setup lang="ts">
import { useInitializeGameObject } from "@/lib/phaser/composables/useInitializeGameObject";
import { type RectangleConfiguration } from "@/lib/phaser/models/configuration/RectangleConfiguration";
import { type RectangleEventEmitsOptions } from "@/lib/phaser/models/emit/RectangleEventEmitsOptions";
import { usePhaserStore } from "@/lib/phaser/store/phaser";
import { RectangleSetterMap } from "@/lib/phaser/util/setterMap/RectangleSetterMap";
import { type GameObjects } from "phaser";

interface RectangleProps {
  configuration: Partial<RectangleConfiguration>;
}

interface RectangleEmits extends /** @vue-ignore */ RectangleEventEmitsOptions {}

const props = defineProps<RectangleProps>();
const { configuration } = toRefs(props);
const { x, y, width, height, fillColor, alpha } = configuration.value;
const emit = defineEmits<RectangleEmits>();
const phaserStore = usePhaserStore();
const { scene } = storeToRefs(phaserStore);
const rectangle = ref(scene.value.add.rectangle(x, y, width, height, fillColor, alpha)) as Ref<GameObjects.Rectangle>;
useInitializeGameObject(rectangle, configuration, emit, RectangleSetterMap);
</script>

<template></template>
