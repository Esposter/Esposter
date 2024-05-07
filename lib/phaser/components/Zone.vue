<script setup lang="ts">
import { useInitializeGameObject } from "@/lib/phaser/composables/useInitializeGameObject";
import type { ZoneConfiguration } from "@/lib/phaser/models/configuration/ZoneConfiguration";
import type { ZoneEventEmitsOptions } from "@/lib/phaser/models/emit/ZoneEventEmitsOptions";
import { ZoneSetterMap } from "@/lib/phaser/util/setterMap/ZoneSetterMap";
import type { SetRequired } from "type-fest";

interface ZoneProps {
  configuration: SetRequired<Partial<ZoneConfiguration>, "x" | "y" | "width" | "height">;
}

interface ZoneEmits extends /** @vue-ignore */ ZoneEventEmitsOptions {}

const { configuration } = defineProps<ZoneProps>();
const emit = defineEmits<ZoneEmits>();

useInitializeGameObject(
  (scene) => {
    const { x, y, width, height } = configuration;
    return scene.add.zone(x, y, width, height);
  },
  () => configuration,
  emit,
  ZoneSetterMap,
);
</script>

<template></template>
