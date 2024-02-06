<script setup lang="ts">
import { useInitializeGameObject } from "@/lib/phaser/composables/useInitializeGameObject";
import { type SpriteConfiguration } from "@/lib/phaser/models/configuration/SpriteConfiguration";
import { type SpriteEventEmitsOptions } from "@/lib/phaser/models/emit/SpriteEventEmitsOptions";
import { usePhaserStore } from "@/lib/phaser/store/phaser";
import { SpriteEventMap } from "@/lib/phaser/util/emit/SpriteEventMap";
import { SpriteSetterMap } from "@/lib/phaser/util/setterMap/SpriteSetterMap";
import { type SetRequired } from "@/util/types/SetRequired";
import { type GameObjects, type Types } from "phaser";

interface SpriteProps {
  configuration: SetRequired<Partial<SpriteConfiguration>, "textureKey">;
}

interface SpriteEmits extends /** @vue-ignore */ SpriteEventEmitsOptions {}

const props = defineProps<SpriteProps>();
const { configuration } = toRefs(props);
const { x, y, textureKey, frame } = configuration.value;
const emit = defineEmits<SpriteEmits>();
const phaserStore = usePhaserStore();
const { scene } = storeToRefs(phaserStore);
const sprite = ref(scene.value.add.sprite(x ?? 0, y ?? 0, textureKey, frame)) as Ref<GameObjects.Sprite>;
const events = Object.keys(SpriteEventMap).filter((key) => key in configuration) as (keyof typeof SpriteEventMap)[];
// @ts-expect-error
// emit has a bunch of different overload types which doesn't match our union type
// but we know that our union type matches the game object events since we're just passing in the same events
for (const event of events) sprite.value.on(event, (...args: Types.Input.EventData[]) => emit(event, ...args));

useInitializeGameObject(sprite, configuration, emit, SpriteSetterMap);
</script>

<template></template>
