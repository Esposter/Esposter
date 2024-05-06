<script setup lang="ts">
import { useInitializeGameObject } from "@/lib/phaser/composables/useInitializeGameObject";
import { onCreate } from "@/lib/phaser/hooks/onCreate";
import type { SpriteConfiguration } from "@/lib/phaser/models/configuration/SpriteConfiguration";
import type { SpriteEventEmitsOptions } from "@/lib/phaser/models/emit/SpriteEventEmitsOptions";
import { SpriteSetterMap } from "@/lib/phaser/util/setterMap/SpriteSetterMap";
import type { SceneWithPlugins } from "@/models/dungeons/scene/SceneWithPlugins";
import type { GameObjects } from "phaser";
import type { SetRequired } from "type-fest";

export interface SpriteProps {
  configuration: SetRequired<Partial<SpriteConfiguration>, "texture">;
  onComplete?: (scene: SceneWithPlugins, sprite: GameObjects.Sprite) => void;
}

interface SpriteEmits extends /** @vue-ignore */ SpriteEventEmitsOptions {}

const props = defineProps<SpriteProps>();
const { configuration, onComplete } = toRefs(props);
const { x, y, texture, frame } = configuration.value;
const emit = defineEmits<SpriteEmits>();
const sprite = ref() as Ref<GameObjects.Sprite>;
useInitializeGameObject(sprite, configuration, emit, SpriteSetterMap);

onCreate((scene) => {
  sprite.value = scene.add.sprite(x ?? 0, y ?? 0, texture, frame);
  onComplete.value?.(scene, sprite.value);
});
</script>

<template></template>
