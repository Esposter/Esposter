<script setup lang="ts">
import type { ZoneConfiguration } from "#src/models/configuration/ZoneConfiguration";
import type { ZoneEventEmitsOptions } from "#src/models/emit/ZoneEventEmitsOptions";
import type { SetRequired } from "type-fest";

import { useInitializeGameObject } from "#src/composables/useInitializeGameObject";
import { ZoneSetterMap } from "#src/util/setterMap/ZoneSetterMap";

interface Props {
  configuration: SetRequired<Partial<ZoneConfiguration>, "height" | "width" | "x" | "y">;
}

interface ZoneEmits extends /** @vue-ignore */ ZoneEventEmitsOptions {}

const { configuration } = defineProps<Props>();
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
