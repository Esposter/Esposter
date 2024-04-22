<script setup lang="ts">
import { useAnimations } from "@/lib/phaser/composables/useAnimations";
import { usePhaserStore } from "@/lib/phaser/store/phaser";
import { AttackGameObjectType } from "@/models/dungeons/attack/AttackGameObjectType";
import type { AttackProps } from "@/models/dungeons/attack/AttackProps";
import { AttackKey } from "@/models/dungeons/keys/spritesheet/AttackKey";
import { Animations } from "phaser";

const { isToEnemy } = defineProps<AttackProps>();
const isActive = defineModel<boolean>("isActive", { required: true });
const emit = defineEmits<{ complete: [] }>();
const phaserStore = usePhaserStore();
const { scene } = storeToRefs(phaserStore);
const playAnimationKey = usePlayAnimation(AttackKey["Ice Shard Start"], isActive, emit);
const animations = useAnimations([
  {
    key: AttackKey["Ice Shard"],
    frames: scene.value.anims.generateFrameNumbers(AttackKey["Ice Shard"]),
    frameRate: 16,
    repeat: 0,
    delay: 0,
  },
  {
    key: AttackKey["Ice Shard Start"],
    frames: scene.value.anims.generateFrameNumbers(AttackKey["Ice Shard Start"]),
    frameRate: 16,
    repeat: 0,
    delay: 0,
  },
]);
const onCompleteKey = `${Animations.Events.ANIMATION_COMPLETE_KEY}${AttackKey["Ice Shard Start"]}`;
</script>

<template>
  <DungeonsBattleAttack
    v-model:is-active="isActive"
    :spritesheet-key="AttackKey['Ice Shard']"
    :animations
    :play-animation-key="playAnimationKey"
    :is-to-enemy="isToEnemy"
    :configuration="{
      type: AttackGameObjectType.Sprite,
    }"
    @[onCompleteKey]="playAnimationKey = AttackKey['Ice Shard']"
  />
</template>
