<script setup lang="ts">
import Container from "@/lib/phaser/components/Container.vue";
import Image from "@/lib/phaser/components/Image.vue";
import Text from "@/lib/phaser/components/Text.vue";
import { type TweenBuilderConfiguration } from "@/lib/phaser/models/configuration/components/TweenBuilderConfiguration";
import { TextureManagerKey } from "@/models/dungeons/keys/TextureManagerKey";
import { dayjs } from "@/services/dayjs";
import { useEnemyStore } from "@/store/dungeons/battle/enemy";
import { usePlayerStore } from "@/store/dungeons/battle/player";
import { type Position } from "grid-engine";

interface InfoContainerProps {
  isEnemy?: true;
}

defineSlots<{ default: (props: Record<string, never>) => unknown }>();
const { isEnemy } = defineProps<InfoContainerProps>();
const store = isEnemy ? useEnemyStore() : usePlayerStore();
const { activeMonster, isPlayingHealthBarAppearAnimation } = storeToRefs(store);
const position = ref<Position>(isEnemy ? { x: -600, y: 0 } : { x: 1200, y: 318 });
const scaleY = computed(() => (isEnemy ? 0.8 : undefined));
const nameDisplayWidth = ref<number>();
const levelX = computed(() => 35 + (nameDisplayWidth.value ?? 0));
const healthBarPercentage = computed(() => (activeMonster.value.currentHp / activeMonster.value.stats.maxHp) * 100);
const tween = computed<TweenBuilderConfiguration | undefined>(() => {
  if (!isPlayingHealthBarAppearAnimation.value) return;

  const xEnd = isEnemy ? 0 : 556;
  return {
    delay: 0,
    duration: dayjs.duration(0.8, "seconds").asMilliseconds(),
    x: {
      from: position.value.x,
      start: position.value.x,
      to: xEnd,
    },
  };
});
</script>

<template>
  <Container :configuration="{ ...position, tween }">
    <Image :configuration="{ textureKey: TextureManagerKey.HealthBarBackground, origin: 0, scaleY }" />
    <Text
      :configuration="{
        x: 30,
        y: 20,
        text: activeMonster.name,
        style: {
          color: '#7e3d3f',
          fontSize: '2rem',
        },
        displayWidth: nameDisplayWidth,
      }"
      @update:display-width="(value: typeof nameDisplayWidth) => (nameDisplayWidth = value)"
    />
    <Text
      :configuration="{
        x: levelX,
        y: 23,
        text: `L${activeMonster.currentLevel}`,
        style: {
          color: '#ed474b',
          fontSize: '1.75rem',
        },
      }"
    />
    <Text
      :configuration="{
        x: 30,
        y: 55,
        text: 'HP',
        style: {
          color: '#ff6505',
          fontSize: '1.5rem',
          fontStyle: 'italic',
        },
      }"
    />
    <DungeonsBattleHealthBarContainer :position="{ x: 34, y: 34 }" :bar-percentage="healthBarPercentage" />
    <Text
      v-if="!isEnemy"
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
  </Container>
</template>
