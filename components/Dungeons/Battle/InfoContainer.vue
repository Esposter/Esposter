<script setup lang="ts">
import Container from "@/lib/phaser/components/Container.vue";
import Image from "@/lib/phaser/components/Image.vue";
import Text from "@/lib/phaser/components/Text.vue";
import { TextureManagerKey } from "@/models/dungeons/keys/TextureManagerKey";
import { type Position } from "grid-engine";

interface InfoContainerProps {
  position?: Position;
  scaleY?: number;
  name: string;
  level: number;
}

const { position, scaleY = 1, name } = defineProps<InfoContainerProps>();
const nameDisplayWidth = ref<number>();
const levelX = computed(() => 35 + (nameDisplayWidth.value ?? 0));
</script>

<template>
  <Container :configuration="{ ...position }">
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
      @update:display-width="(value: number | undefined) => (nameDisplayWidth = value)"
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
      @update:display-width="(value: number | undefined) => (nameDisplayWidth = value)"
    />
    <DungeonsBattleHealthBarContainer :position="{ x: 34, y: 34 }" />
  </Container>
</template>
