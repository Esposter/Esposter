<script setup lang="ts">
import { useInitializeGameObject } from "@/lib/phaser/composables/useInitializeGameObject";
import type { TileSpriteConfiguration } from "@/lib/phaser/models/configuration/TileSpriteConfiguration";
import type { TileSpriteEventEmitsOptions } from "@/lib/phaser/models/emit/TileSpriteEventEmitsOptions";
import { InjectionKeyMap } from "@/lib/phaser/util/InjectionKeyMap";
import { TileSpriteSetterMap } from "@/lib/phaser/util/setterMap/TileSpriteSetterMap";
import type { SceneWithPlugins } from "@/models/dungeons/scene/SceneWithPlugins";
import { NotInitializedError } from "@/models/error/NotInitializedError";
import type { SetRequired } from "@/util/types/SetRequired";
import type { GameObjects } from "phaser";

export interface TileSpriteProps {
  configuration: SetRequired<Partial<TileSpriteConfiguration>, "texture">;
}

interface TileSpriteEmits extends /** @vue-ignore */ TileSpriteEventEmitsOptions {}

const props = defineProps<TileSpriteProps>();
const { configuration } = toRefs(props);
const { x, y, width, height, texture, frame } = configuration.value;
const emit = defineEmits<TileSpriteEmits>();
const scene = inject<SceneWithPlugins>(InjectionKeyMap.Scene);
if (!scene) throw new NotInitializedError("Scene");

const tileSprite = ref(
  scene.add.tileSprite(x ?? 0, y ?? 0, width ?? 0, height ?? 0, texture, frame),
) as Ref<GameObjects.TileSprite>;
useInitializeGameObject(tileSprite, configuration, emit, TileSpriteSetterMap);
</script>

<template></template>
