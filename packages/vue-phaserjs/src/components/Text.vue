<script setup lang="ts">
import type { TextEventEmitsOptions } from "@/models/emit/TextEventEmitsOptions";
import type { TextProps } from "@/models/text/TextProps";

import { useInitializeGameObject } from "@/composables/useInitializeGameObject";
import { useTextStore } from "@/store/text";
import { TextSetterMap } from "@/util/setterMap/TextSetterMap";

interface TextEmits extends /** @vue-ignore */ TextEventEmitsOptions {}

const { configuration, immediate } = defineProps<TextProps>();
const emit = defineEmits<TextEmits>();
const textStore = useTextStore();
const { defaultTextStyle } = storeToRefs(textStore);

useInitializeGameObject(
  (scene) => {
    const { style, text, x, y } = configuration;
    return scene.add.text(x ?? 0, y ?? 0, text, { ...defaultTextStyle.value, ...style });
  },
  () => configuration,
  emit,
  TextSetterMap,
  immediate,
);
</script>

<template></template>
