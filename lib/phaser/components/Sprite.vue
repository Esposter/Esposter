<script setup lang="ts">
import { useInitializeGameObject } from "@/lib/phaser/composables/useInitializeGameObject";
import { type SpriteConfiguration } from "@/lib/phaser/models/configuration/SpriteConfiguration";
import { type SpriteEventEmitsOptions } from "@/lib/phaser/models/emit/SpriteEventEmitsOptions";
import { usePhaserStore } from "@/lib/phaser/store/phaser";
import { SpriteSetterMap } from "@/lib/phaser/util/setterMap/SpriteSetterMap";
import { type SetRequired } from "@/util/types/SetRequired";
import { type GameObjects } from "phaser";

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
useInitializeGameObject(sprite, configuration, emit, SpriteSetterMap);
</script>

<template></template>
