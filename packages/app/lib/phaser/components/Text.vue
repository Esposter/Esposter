<script setup lang="ts">
import type { TextConfiguration } from "@/lib/phaser/models/configuration/TextConfiguration";
import type { TextEventEmitsOptions } from "@/lib/phaser/models/emit/TextEventEmitsOptions";
import type { SetRequired } from "type-fest";

import { useInitializeGameObject } from "@/lib/phaser/composables/useInitializeGameObject";
import { TextSetterMap } from "@/lib/phaser/util/setterMap/TextSetterMap";
import { FontKey } from "@/models/dungeons/keys/FontKey";

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
    return scene.add.text(x ?? 0, y ?? 0, text, { fontFamily: FontKey.KenneyFutureNarrow, ...style });
  },
  () => configuration,
  emit,
  TextSetterMap,
  immediate,
);
</script>

<template></template>
