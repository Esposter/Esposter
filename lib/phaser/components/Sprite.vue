<script setup lang="ts">
import { useInitializeGameObject } from "@/lib/phaser/composables/useInitializeGameObject";
import type { SpriteConfiguration } from "@/lib/phaser/models/configuration/SpriteConfiguration";
import type { SpriteEventEmitsOptions } from "@/lib/phaser/models/emit/SpriteEventEmitsOptions";
import { InjectionKeyMap } from "@/lib/phaser/util/InjectionKeyMap";
import { SpriteSetterMap } from "@/lib/phaser/util/setterMap/SpriteSetterMap";
import type { SceneWithPlugins } from "@/models/dungeons/scene/SceneWithPlugins";
import { NotInitializedError } from "@/models/error/NotInitializedError";
import type { SetRequired } from "@/util/types/SetRequired";
import type { GameObjects } from "phaser";

export interface SpriteProps {
  configuration: SetRequired<Partial<SpriteConfiguration>, "texture">;
  onComplete?: (sprite: GameObjects.Sprite) => void;
}

interface SpriteEmits extends /** @vue-ignore */ SpriteEventEmitsOptions {}

const props = defineProps<SpriteProps>();
const { configuration, onComplete } = toRefs(props);
const { x, y, texture, frame } = configuration.value;
const emit = defineEmits<SpriteEmits>();
const scene = inject<SceneWithPlugins>(InjectionKeyMap.Scene);
if (!scene) throw new NotInitializedError("Scene");

const sprite = ref(scene.add.sprite(x ?? 0, y ?? 0, texture, frame)) as Ref<GameObjects.Sprite>;
useInitializeGameObject(sprite, configuration, emit, SpriteSetterMap);
onComplete.value?.(sprite.value);
</script>

<template></template>
