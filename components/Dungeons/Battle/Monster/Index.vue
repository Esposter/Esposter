<script setup lang="ts">
import Image from "@/lib/phaser/components/Image.vue";
import Text from "@/lib/phaser/components/Text.vue";
import { type TweenBuilderConfiguration } from "@/lib/phaser/models/configuration/components/TweenBuilderConfiguration";
import { type Monster } from "@/models/dungeons/battle/monsters/Monster";
import { type Position } from "grid-engine";
import { type AnimationState } from "~/models/dungeons/battle/monsters/AnimationState";
import { TakeDamageTween } from "~/services/dungeons/battle/monster/TakeDamageTween";

interface MonsterProps {
  monster: Monster;
  // By default, this will be the player
  isEnemy?: true;
}

const { monster, isEnemy } = defineProps<MonsterProps>();
const animationState = defineModel<AnimationState | null>("animationState");
const position = computed<Position>(() => (isEnemy ? { x: 768, y: 144 } : { x: 256, y: 316 }));
const tween = computed<TweenBuilderConfiguration | undefined>(() => {
  if (!animationState.value) return;
  return {
    ...TakeDamageTween,
    onComplete: (...args) => {
      TakeDamageTween.onComplete?.(...args);
      animationState.value = null;
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
