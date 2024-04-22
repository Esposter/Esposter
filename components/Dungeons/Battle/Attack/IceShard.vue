<script setup lang="ts">
import { useAnimations } from "@/lib/phaser/composables/useAnimations";
import { usePhaserStore } from "@/lib/phaser/store/phaser";
import { AttackGameObjectType } from "@/models/dungeons/attack/AttackGameObjectType";
import type { AttackProps } from "@/models/dungeons/attack/AttackProps";
import { SpritesheetKey } from "@/models/dungeons/keys/spritesheet/SpritesheetKey";
import { Animations } from "phaser";

const { isToEnemy } = defineProps<AttackProps>();
const isActive = defineModel<boolean>("isActive", { required: true });
const emit = defineEmits<{ complete: [] }>();
const phaserStore = usePhaserStore();
const { scene } = storeToRefs(phaserStore);
const playAnimationKey = usePlayAnimation(SpritesheetKey["Ice Shard Start"], isActive, emit);
const animations = useAnimations([
  {
    key: SpritesheetKey["Ice Shard"],
    frames: scene.value.anims.generateFrameNumbers(SpritesheetKey["Ice Shard"]),
    frameRate: 16,
    repeat: 0,
    delay: 0,
  },
  {
    key: SpritesheetKey["Ice Shard Start"],
    frames: scene.value.anims.generateFrameNumbers(SpritesheetKey["Ice Shard Start"]),
    frameRate: 16,
    repeat: 0,
    delay: 0,
  },
]);
</script>

<template>
  <DungeonsBattleAttack
    v-model:is-active="isActive"
    :spritesheet-key="SpritesheetKey["Ice Shard"]"
    :animations
    :play-animation-key="playAnimationKey"
    :is-to-enemy="isToEnemy"
    :configuration="{
      type: AttackGameObjectType.Sprite,
    }"
    Shard Start"]}`]="
      playAnimationKey = SpritesheetKey[" Shard"] "
    @[`${animations.Events.ANIMATION_COMPLETE_KEY}${SpritesheetKey["IceIce
  />
</template>
