<script setup lang="ts">
import { useInitializeGameObject } from "@/lib/phaser/composables/useInitializeGameObject";
import { onCreate } from "@/lib/phaser/hooks/onCreate";
import type { TextConfiguration } from "@/lib/phaser/models/configuration/TextConfiguration";
import type { TextEventEmitsOptions } from "@/lib/phaser/models/emit/TextEventEmitsOptions";
import { TextSetterMap } from "@/lib/phaser/util/setterMap/TextSetterMap";
import { FontKey } from "@/models/dungeons/keys/FontKey";
import type { GameObjects } from "phaser";
import type { SetRequired } from "type-fest";

interface TextProps {
  configuration: SetRequired<Partial<TextConfiguration>, "text">;
}

interface TextEmits extends /** @vue-ignore */ TextEventEmitsOptions {}

const props = defineProps<TextProps>();
const { configuration } = toRefs(props);
const { x, y, text, style } = configuration.value;
const emit = defineEmits<TextEmits>();
const textGameObject = ref<GameObjects.Text>();

onCreate((scene) => {
  textGameObject.value = scene.add.text(x ?? 0, y ?? 0, text, { fontFamily: FontKey.KenneyFutureNarrow, ...style });
});

useInitializeGameObject(textGameObject, configuration, emit, TextSetterMap);
</script>

<template></template>
