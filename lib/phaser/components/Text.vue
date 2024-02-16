<script setup lang="ts">
import { useInitializeGameObject } from "@/lib/phaser/composables/useInitializeGameObject";
import { type TextConfiguration } from "@/lib/phaser/models/configuration/TextConfiguration";
import { type TextEventEmitsOptions } from "@/lib/phaser/models/emit/TextEventEmitsOptions";
import { usePhaserStore } from "@/lib/phaser/store/phaser";
import { TextSetterMap } from "@/lib/phaser/util/setterMap/TextSetterMap";
import { FontKey } from "@/models/dungeons/keys/FontKey";
import { type SetRequired } from "@/util/types/SetRequired";
import { type GameObjects } from "phaser";

interface TextProps {
  configuration: SetRequired<Partial<TextConfiguration>, "text">;
}

interface TextEmits extends /** @vue-ignore */ TextEventEmitsOptions {}

const props = defineProps<TextProps>();
const { configuration } = toRefs(props);
const { x, y, text, style } = configuration.value;
const emit = defineEmits<TextEmits>();
const phaserStore = usePhaserStore();
const { scene } = storeToRefs(phaserStore);
const textGameObject = ref(
  scene.value.add.text(x ?? 0, y ?? 0, text, { fontFamily: FontKey["Kenney-Future-Narrow"], ...style }),
) as Ref<GameObjects.Text>;
useInitializeGameObject(textGameObject, configuration, emit, TextSetterMap);
</script>

<template></template>
