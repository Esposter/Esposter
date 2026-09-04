<script setup lang="ts">
import type { BitmapTextConfiguration } from "#src/models/configuration/BitmapTextConfiguration";
import type { BitmapTextEventEmitsOptions } from "#src/models/emit/BitmapTextEventEmitsOptions";
import type { SceneWithPlugins } from "#src/models/scene/SceneWithPlugins";
import type { GameObjects } from "phaser";

import { useInitializeGameObject } from "#src/composables/useInitializeGameObject";
import { BitmapTextSetterMap } from "#src/util/setterMap/BitmapTextSetterMap";

interface BitmapTextEmits extends /** @vue-ignore */ BitmapTextEventEmitsOptions {}

interface Props {
  configuration: Partial<BitmapTextConfiguration> & Pick<BitmapTextConfiguration, "font">;
  immediate?: true;
  onComplete?: (scene: SceneWithPlugins, bitmapText: GameObjects.BitmapText) => void;
}

const { configuration, immediate, onComplete } = defineProps<Props>();
const emit = defineEmits<BitmapTextEmits>();

useInitializeGameObject(
  (scene) => {
    const { align, font, fontSize, text, x, y } = configuration;
    const bitmapText = scene.add.bitmapText(x ?? 0, y ?? 0, font, text, fontSize, align);
    onComplete?.(scene, bitmapText);
    return bitmapText;
  },
  () => configuration,
  emit,
  BitmapTextSetterMap,
  immediate,
);
</script>

<template></template>
