<script setup lang="ts">
import Image from "@/lib/phaser/components/Image.vue";
import Text from "@/lib/phaser/components/Text.vue";
import { type TweenBuilderConfiguration } from "@/lib/phaser/models/configuration/components/TweenBuilderConfiguration";
import { AnimationState } from "@/models/dungeons/battle/monsters/AnimationState";
import { dayjs } from "@/services/dayjs";
import { useEnemyStore } from "@/store/dungeons/scene/battle/enemy";
import { usePlayerStore } from "@/store/dungeons/scene/battle/player";
import { exhaustiveGuard } from "@/util/exhaustiveGuard";
import { type Position } from "grid-engine";

interface MonsterProps {
  // By default, this will be the player
  isEnemy?: true;
}

const { isEnemy } = defineProps<MonsterProps>();
const store = isEnemy ? useEnemyStore() : usePlayerStore();
const { activeMonsterAnimationStateOnComplete } = store;
const { activeMonster, activeMonsterAnimationState, isPlayingHealthBarAppearAnimation } = storeToRefs(store);
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
        onComplete: activeMonsterAnimationStateOnComplete,
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
          activeMonsterAnimationStateOnComplete?.();
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
        onComplete: activeMonsterAnimationStateOnComplete,
      } as TweenBuilderConfiguration;
    default:
      exhaustiveGuard(activeMonsterAnimationState.value);
  }
});
const infoContainerPosition = computed<Position | undefined>(() => (isEnemy ? undefined : { x: 556, y: 318 }));
const infoContainerScaleY = computed(() => (isEnemy ? 0.8 : undefined));
const healthBarPercentage = computed(() => (activeMonster.value.currentHp / activeMonster.value.stats.maxHp) * 100);
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
  <DungeonsBattleMonsterInfoContainer
    v-model:is-playing-appear-animation="isPlayingHealthBarAppearAnimation"
    :position="infoContainerPosition"
    :scale-y="infoContainerScaleY"
    :name="activeMonster.name"
    :level="activeMonster.currentLevel"
    :health-bar-percentage="healthBarPercentage"
  >
    <template v-if="!isEnemy">
      <Text
        :configuration="{
          x: 443,
          y: 80,
          originX: 1,
          originY: 0,
          text: `${activeMonster.currentHp}/${activeMonster.stats.maxHp}`,
          style: {
            color: '#7e3d3f',
            fontSize: '1rem',
          },
        }"
      />
    </template>
  </DungeonsBattleMonsterInfoContainer>
</template>
