<script setup lang="ts">
import Image from "@/lib/phaser/components/Image.vue";
import { type TweenBuilderConfiguration } from "@/lib/phaser/models/configuration/components/TweenBuilderConfiguration";
import { AnimationState } from "@/models/dungeons/battle/monsters/AnimationState";
import { dayjs } from "@/services/dayjs";
import { useEnemyStore } from "@/store/dungeons/scene/battle/enemy";
import { usePlayerStore } from "@/store/dungeons/scene/battle/player";
import { exhaustiveGuard } from "@/util/exhaustiveGuard";

interface MonsterProps {
  // By default, this will be the player
  isEnemy?: true;
}

const { isEnemy } = defineProps<MonsterProps>();
const store = isEnemy ? useEnemyStore() : usePlayerStore();
const { activeMonster, activeMonsterAnimationState, activeMonsterAnimationStateOnComplete } = storeToRefs(store);
const x = ref(isEnemy ? 768 : 256);
const y = computed(() => (isEnemy ? 144 : 316));
const tween = computed<TweenBuilderConfiguration | undefined>(() => {
  if (!activeMonsterAnimationState.value) return;

  let xStart: number;
  let yEnd: number;

  switch (activeMonsterAnimationState.value) {
    case AnimationState.Appear:
      xStart = -30;
      return {
        delay: 0,
        duration: dayjs.duration(isEnemy ? 1.6 : 0.8, "seconds").asMilliseconds(),
        x: {
          from: xStart,
          start: xStart,
          to: x.value,
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
        onComplete: (_, monsterImageGameObject) => {
          monsterImageGameObject.setAlpha(1);
          activeMonsterAnimationStateOnComplete.value?.();
        },
      } as TweenBuilderConfiguration;
    case AnimationState.Death:
      yEnd = isEnemy ? y.value - 400 : y.value + 400;
      return {
        delay: 0,
        duration: dayjs.duration(2, "seconds").asMilliseconds(),
        y: {
          from: y.value,
          start: y.value,
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
      x,
      y,
      textureKey: activeMonster.asset.key,
      frame: activeMonster.asset.frame,
      flipX: !isEnemy,
      tween,
    }"
    @update:x="(value: typeof x) => (x = value)"
  />
  <DungeonsBattleMonsterInfoContainer :is-enemy="isEnemy" />
</template>
