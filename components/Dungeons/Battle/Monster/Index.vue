<script setup lang="ts">
import Image from "@/lib/phaser/components/Image.vue";
import Text from "@/lib/phaser/components/Text.vue";
import { type TweenBuilderConfiguration } from "@/lib/phaser/models/configuration/components/TweenBuilderConfiguration";
import { type Monster } from "@/models/dungeons/battle/monsters/Monster";
import { dayjs } from "@/services/dayjs";
import { type Position } from "grid-engine";

interface MonsterProps {
  monster: Monster;
  // By default, this will be the player
  isEnemy?: true;
}

const { monster, isEnemy } = defineProps<MonsterProps>();
const playTakeDamageAnimation = defineModel<true | undefined>("playTakeDamageAnimation");
const position = computed<Position>(() => (isEnemy ? { x: 768, y: 144 } : { x: 256, y: 316 }));
const tween = computed<TweenBuilderConfiguration | undefined>(() => {
  if (!playTakeDamageAnimation.value) return;
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
      playTakeDamageAnimation.value = undefined;
    },
  };
});
const healthBarPosition = computed<Position | undefined>(() => (isEnemy ? undefined : { x: 556, y: 318 }));
const healthBarScaleY = computed(() => (isEnemy ? 0.8 : undefined));
</script>

<template>
  <Image
    :configuration="{ ...position, textureKey: monster.asset.key, frame: monster.asset.frame, flipX: !isEnemy, tween }"
  />
  <DungeonsBattleMonsterInfoContainer
    :position="healthBarPosition"
    :scale-y="healthBarScaleY"
    :name="monster.name"
    :level="monster.currentLevel"
  >
    <template v-if="!isEnemy">
      <Text
        :configuration="{
          x: 443,
          y: 80,
          originX: 1,
          originY: 0,
          text: `${monster.currentHp}/${monster.stats.maxHp}`,
          style: {
            color: '#7e3d3f',
            fontSize: '1rem',
          },
        }"
      />
    </template>
  </DungeonsBattleMonsterInfoContainer>
</template>
