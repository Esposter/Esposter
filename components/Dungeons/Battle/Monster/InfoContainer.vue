<script setup lang="ts">
import Container from "@/lib/phaser/components/Container.vue";
import Image from "@/lib/phaser/components/Image.vue";
import Text from "@/lib/phaser/components/Text.vue";
import { type TweenBuilderConfiguration } from "@/lib/phaser/models/configuration/components/TweenBuilderConfiguration";
import { TextureManagerKey } from "@/models/dungeons/keys/TextureManagerKey";
import { dayjs } from "@/services/dayjs";
import { type Position } from "grid-engine";

interface InfoContainerProps {
  position?: Position;
  scaleY?: number;
  name: string;
  level: number;
  healthBarPercentage: number;
}

defineSlots<{ default: (props: Record<string, never>) => unknown }>();
const { position, scaleY, name, level, healthBarPercentage } = defineProps<InfoContainerProps>();
const isPlayingAppearAnimation = defineModel<true | undefined>("isPlayingAppearAnimation", { required: true });
const nameDisplayWidth = ref<number>();
const levelX = computed(() => 35 + (nameDisplayWidth.value ?? 0));
const tween = computed<TweenBuilderConfiguration | undefined>(() => {
  if (!isPlayingAppearAnimation.value) return;
  return {
    delay: 0,
    duration: dayjs.duration(0.8, "seconds").asMilliseconds(),
    x: {
      from: 800,
      start: 800,
      to: position?.x,
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
        text: name,
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
        text: `L${level}`,
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
    <slot />
  </Container>
</template>
