<script setup lang="ts">
import Image from "@/lib/phaser/components/Image.vue";
import { type TweenBuilderConfiguration } from "@/lib/phaser/models/configuration/components/TweenBuilderConfiguration";
import { AnimationState } from "@/models/dungeons/battle/monsters/AnimationState";
import { dayjs } from "@/services/dayjs";
import { useEnemyStore } from "@/store/dungeons/battle/enemy";
import { usePlayerStore } from "@/store/dungeons/battle/player";
import { exhaustiveGuard } from "@/util/exhaustiveGuard";
import { type Position } from "grid-engine";

interface MonsterProps {
  // By default, this will be the player
  isEnemy?: true;
}

const { isEnemy } = defineProps<MonsterProps>();
const store = isEnemy ? useEnemyStore() : usePlayerStore();
const { activeMonster, activeMonsterAnimationState, activeMonsterAnimationStateOnComplete } = storeToRefs(store);
const position = ref<Position>(isEnemy ? { x: -100, y: 144 } : { x: -100, y: 316 });
const tween = computed<TweenBuilderConfiguration | undefined>(() => {
  if (!activeMonsterAnimationState.value) return;

  let xEnd: number;
  let yEnd: number;

  switch (activeMonsterAnimationState.value) {
    case AnimationState.Appear:
      xEnd = isEnemy ? 768 : 256;
      return {
        delay: 0,
        duration: dayjs.duration(isEnemy ? 1.6 : 0.8, "seconds").asMilliseconds(),
        x: {
          from: position.value.x,
          start: position.value.x,
          to: xEnd,
        },
        onComplete: activeMonsterAnimationStateOnComplete.value,
      } as TweenBuilderConfiguration;
    case AnimationState.TakeDamage:
      return {
        delay: 0,
        repeat: 10,
        duration: dayjs.duration(0.15, "seconds").asMilliseconds(),
        alpha: {
          from: 1,
          start: 1,
          to: 0,
        },
        onComplete: (_, [monsterImageGameObject]) => {
          monsterImageGameObject.setAlpha(1);
          activeMonsterAnimationStateOnComplete.value?.();
        },
      } as TweenBuilderConfiguration;
    case AnimationState.Death:
      yEnd = isEnemy ? position.value.y - 400 : position.value.y + 400;
      return {
        delay: 0,
        duration: dayjs.duration(2, "seconds").asMilliseconds(),
        y: {
          from: position.value.y,
          start: position.value.y,
          to: yEnd,
        },
        onComplete: activeMonsterAnimationStateOnComplete.value,
      } as TweenBuilderConfiguration;
    default:
      exhaustiveGuard(activeMonsterAnimationState.value);
  }
});
</script>

<template>
  <Image
    :configuration="{
      ...position,
      textureKey: activeMonster.asset.key,
      frame: activeMonster.asset.frame,
      flipX: !isEnemy,
      tween,
    }"
    @update:x="(value: typeof position.x) => (position.x = value)"
  />
  <DungeonsBattleMonsterInfoContainer :is-enemy="isEnemy" />
</template>
