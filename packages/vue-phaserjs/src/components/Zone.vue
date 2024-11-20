<script setup lang="ts">
import type { ZoneConfiguration } from "@/models/configuration/ZoneConfiguration";
import type { ZoneEventEmitsOptions } from "@/models/emit/ZoneEventEmitsOptions";
import type { SetRequired } from "type-fest";

import { useInitializeGameObject } from "@/composables/useInitializeGameObject";
import { ZoneSetterMap } from "@/utils/setterMap/ZoneSetterMap";

interface ZoneEmits extends /** @vue-ignore */ ZoneEventEmitsOptions {}

interface ZoneProps {
  configuration: SetRequired<Partial<ZoneConfiguration>, "height" | "width" | "x" | "y">;
}

const { configuration } = defineProps<ZoneProps>();
const emit = defineEmits<ZoneEmits>();

useInitializeGameObject(
  (scene) => {
    const { height, width, x, y } = configuration;
    return scene.add.zone(x, y, width, height);
  },
  () => configuration,
  emit,
  ZoneSetterMap,
);
</script>

<template></template>
