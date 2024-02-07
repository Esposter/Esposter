<script setup lang="ts">
import { usePhaserStore } from "@/lib/phaser/store/phaser";
import { SpritesheetKey } from "@/models/dungeons/keys/SpritesheetKey";
import { Animations } from "phaser";

const isActive = defineModel<boolean>("isActive", { required: true });
const emit = defineEmits<{ complete: [] }>();
const phaserStore = usePhaserStore();
const { scene } = storeToRefs(phaserStore);
const playAnimationKey = usePlayAnimation(SpritesheetKey.IceShardStart, isActive, emit);
</script>

<template>
  <DungeonsBattleAttack
    v-model:is-active="isActive"
    :position="{ x: 745, y: 140 }"
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
    @[`${Animations.Events.ANIMATION_COMPLETE_KEY}${SpritesheetKey.IceShardStart}`]="
      playAnimationKey = SpritesheetKey.IceShard
    "
  />
</template>
