<script setup lang="ts">
import { useInitializeGameObject } from "@/lib/phaser/composables/useInitializeGameObject";
import type { TextConfiguration } from "@/lib/phaser/models/configuration/TextConfiguration";
import type { TextEventEmitsOptions } from "@/lib/phaser/models/emit/TextEventEmitsOptions";
import { TextSetterMap } from "@/lib/phaser/util/setterMap/TextSetterMap";
import { FontKey } from "@/models/dungeons/keys/FontKey";
import type { SetRequired } from "type-fest";

interface TextProps {
  configuration: SetRequired<Partial<TextConfiguration>, "text">;
  immediate?: true;
}

interface TextEmits extends /** @vue-ignore */ TextEventEmitsOptions {}

const { configuration, immediate } = defineProps<TextProps>();
const emit = defineEmits<TextEmits>();

useInitializeGameObject(
  (scene) => {
    const { x, y, text, style } = configuration;
    return scene.add.text(x ?? 0, y ?? 0, text, { fontFamily: FontKey.KenneyFutureNarrow, ...style });
  },
  () => configuration,
  emit,
  TextSetterMap,
  immediate,
);
</script>

<template></template>
