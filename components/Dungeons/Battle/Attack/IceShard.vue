<script setup lang="ts">
import { usePhaserStore } from "@/lib/phaser/store/phaser";
import { AttackGameObjectType } from "@/models/dungeons/attack/AttackGameObjectType";
import { type AttackProps } from "@/models/dungeons/attack/AttackProps";
import { SpritesheetKey } from "@/models/dungeons/keys/SpritesheetKey";
import { Animations } from "phaser";

const { isToEnemy } = defineProps<AttackProps>();
const isActive = defineModel<boolean>("isActive", { required: true });
const emit = defineEmits<{ complete: [] }>();
const phaserStore = usePhaserStore();
const { scene } = storeToRefs(phaserStore);
const playAnimationKey = usePlayAnimation(SpritesheetKey.IceShardStart, isActive, emit);
</script>

<template>
  <DungeonsBattleAttack
    v-model:is-active="isActive"
    :spritesheet-key="SpritesheetKey.IceShard"
    :animations="[
      {
        key: SpritesheetKey.IceShard,
        frames: scene.anims.generateFrameNumbers(SpritesheetKey.IceShard),
        frameRate: 8,
        repeat: 0,
        delay: 0,
      },
      {
        key: SpritesheetKey.IceShardStart,
        frames: scene.anims.generateFrameNumbers(SpritesheetKey.IceShardStart),
        frameRate: 8,
        repeat: 0,
        delay: 0,
      },
    ]"
    :play-animation-key="playAnimationKey"
    :is-to-enemy="isToEnemy"
    :configuration="{
      type: AttackGameObjectType.Sprite,
    }"
    @[`${Animations.Events.ANIMATION_COMPLETE_KEY}${SpritesheetKey.IceShardStart}`]="
      playAnimationKey = SpritesheetKey.IceShard
    "
  />
</template>
