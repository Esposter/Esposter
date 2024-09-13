<script setup lang="ts">
import type { TextConfiguration } from "@/models/configuration/TextConfiguration";
import type { TextEventEmitsOptions } from "@/models/emit/TextEventEmitsOptions";
import type { SetRequired } from "type-fest";

import { useInitializeGameObject } from "@/composables/useInitializeGameObject";
import { TextSetterMap } from "@/utils/setterMap/TextSetterMap";

interface TextProps {
  configuration: SetRequired<Partial<TextConfiguration>, "text">;
  immediate?: true;
}

interface TextEmits extends /** @vue-ignore */ TextEventEmitsOptions {}

const { configuration, immediate } = defineProps<TextProps>();
const emit = defineEmits<TextEmits>();

useInitializeGameObject(
  (scene) => {
    const { style, text, x, y } = configuration;
    return scene.add.text(x ?? 0, y ?? 0, text, style);
  },
  () => configuration,
  emit,
  TextSetterMap,
  immediate,
);
</script>

<template></template>
