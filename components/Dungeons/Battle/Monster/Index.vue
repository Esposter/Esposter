<script setup lang="ts">
import Image from "@/lib/phaser/components/Image.vue";
import { type TweenBuilderConfiguration } from "@/lib/phaser/models/configuration/components/TweenBuilderConfiguration";
import { AnimationState } from "@/models/dungeons/battle/monsters/AnimationState";
import { dayjs } from "@/services/dayjs";
import { useEnemyStore } from "@/store/dungeons/battle/enemy";
import { usePlayerStore } from "@/store/dungeons/battle/player";
import { useSettingsStore } from "@/store/dungeons/settings";
import { exhaustiveGuard } from "@/util/exhaustiveGuard";
import { type Position } from "grid-engine";

interface MonsterProps {
  // By default, this will be the player
  isEnemy?: true;
}

const { isEnemy } = defineProps<MonsterProps>();
const store = isEnemy ? useEnemyStore() : usePlayerStore();
const { activeMonster, activeMonsterAnimationState } = storeToRefs(store);
const activeMonsterAnimationStateOnComplete = useActiveMonsterAnimationStateOnComplete(isEnemy);
const settingsStore = useSettingsStore();
const { isSkipBattleAnimations } = storeToRefs(settingsStore);
const position = ref<Position>(isEnemy ? { x: -100, y: 144 } : { x: -100, y: 316 });
const isOnCompleteActive = ref(false);
// We can't actually call the onComplete inside the computed tween
// because it resets the animation state and recursive updates aren't applied
// inside the computed, so we have to manually trigger it through a watch
const onComplete = () => {
  isOnCompleteActive.value = true;
};
const tween = computed<TweenBuilderConfiguration | undefined>(() => {
  if (!activeMonsterAnimationState.value) return;

  let xEnd: number;
  let yEnd: number;

  switch (activeMonsterAnimationState.value) {
    case AnimationState.Appear:
      xEnd = isEnemy ? 768 : 256;
      if (isSkipBattleAnimations.value) {
        position.value.x = xEnd;
        onComplete();
        return;
      } else
        return {
          delay: 0,
          duration: dayjs.duration(isEnemy ? 1.6 : 0.8, "seconds").asMilliseconds(),
          x: {
            from: position.value.x,
            start: position.value.x,
            to: xEnd,
          },
          onComplete,
        } as TweenBuilderConfiguration;
    case AnimationState.TakeDamage:
      if (isSkipBattleAnimations.value) {
        onComplete();
        return;
      } else
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
            onComplete();
          },
        } as TweenBuilderConfiguration;
    case AnimationState.Death:
      yEnd = isEnemy ? position.value.y - 400 : position.value.y + 400;
      if (isSkipBattleAnimations.value) {
        position.value.y = yEnd;
        onComplete();
        return;
      } else
        return {
          delay: 0,
          duration: dayjs.duration(2, "seconds").asMilliseconds(),
          y: {
            from: position.value.y,
            start: position.value.y,
            to: yEnd,
          },
          onComplete,
        } as TweenBuilderConfiguration;
    default:
      exhaustiveGuard(activeMonsterAnimationState.value);
  }
});

watch(isOnCompleteActive, (newIsOnCompleteActive) => {
  if (newIsOnCompleteActive) {
    activeMonsterAnimationStateOnComplete();
    isOnCompleteActive.value = false;
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
  />
  <DungeonsBattleMonsterInfoContainer :is-enemy="isEnemy" />
</template>
