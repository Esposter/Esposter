<script setup lang="ts">
import type { RenderTextureConfiguration } from "#src/models/configuration/RenderTextureConfiguration";
import type { RenderTextureEventEmitsOptions } from "#src/models/emit/RenderTextureEventEmitsOptions";
import type { SceneWithPlugins } from "#src/models/scene/SceneWithPlugins";
import type { GameObjects } from "phaser";
import type { UndefinedOnPartial } from "type-fest";

import { useInitializeGameObject } from "#src/composables/useInitializeGameObject";
import { RenderTextureSetterMap } from "#src/services/setterMap/RenderTextureSetterMap";

interface Props {
  configuration: UndefinedOnPartial<Partial<RenderTextureConfiguration>>;
  immediate?: true | undefined;
  onComplete?: ((scene: SceneWithPlugins, renderTexture: GameObjects.RenderTexture) => void) | undefined;
}

interface RenderTextureEmits extends /** @vue-ignore */ RenderTextureEventEmitsOptions {}

const { configuration, immediate, onComplete } = defineProps<Props>();
const emit = defineEmits<RenderTextureEmits>();

useInitializeGameObject(
  (scene) => {
    const { height, width, x, y } = configuration;
    const renderTexture = scene.add.renderTexture(x ?? 0, y ?? 0, width, height);
    onComplete?.(scene, renderTexture);
    return renderTexture;
  },
  () => configuration,
  emit,
  RenderTextureSetterMap,
  immediate,
);
</script>

<template></template>
