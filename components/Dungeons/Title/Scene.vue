<script setup lang="ts">
import { MenuTextStyle } from "@/assets/dungeons/title/styles/MenuTextStyle";
import Container from "@/lib/phaser/components/Container.vue";
import Image from "@/lib/phaser/components/Image.vue";
import Scene from "@/lib/phaser/components/Scene.vue";
import Text from "@/lib/phaser/components/Text.vue";
import { usePhaserStore } from "@/lib/phaser/store/phaser";
import { ImageKey } from "@/models/dungeons/keys/ImageKey";
import { SceneKey } from "@/models/dungeons/keys/SceneKey";
import { SceneWithPlugins } from "@/models/dungeons/scene/SceneWithPlugins";
import { dayjs } from "@/services/dayjs";
import { CursorPositionMap } from "@/services/dungeons/title/menu/CursorPositionMap";
import { PlayerOptionGrid } from "@/services/dungeons/title/menu/PlayerOptionGrid";
import { INITIAL_CURSOR_POSITION } from "@/services/dungeons/title/menu/constants";
import { useGameStore } from "@/store/dungeons/game";
import type { Position } from "grid-engine";

const phaserStore = usePhaserStore();
const { scene } = storeToRefs(phaserStore);
const gameStore = useGameStore();
const { controls } = storeToRefs(gameStore);
const menuBackgroundWidth = 500;
const menuContainerX = computed(() => scene.value.scale.width / 2 - menuBackgroundWidth / 2);
const cursorPositions = computed(() => CursorPositionMap.flatMap<Position>((positions) => positions));
</script>

<template>
  <Scene :scene-key="SceneKey.Title" :cls="SceneWithPlugins">
    <Image
      :configuration="{
        textureKey: ImageKey.TitleScreenBackground,
        origin: 0,
        scale: 0.58,
      }"
    />
    <Image
      :configuration="{
        x: scene.scale.width / 2,
        y: 150,
        textureKey: ImageKey.TitleTextBackground,
        scale: 0.25,
        alpha: 0.5,
      }"
    />
    <Image
      :configuration="{
        x: scene.scale.width / 2,
        y: 150,
        textureKey: ImageKey.TitleText,
        scale: 0.55,
        alpha: 0.5,
      }"
    />
    <Container
      :configuration="{
        x: menuContainerX,
        y: 300,
      }"
    >
      <Container>
        <Image
          :configuration="{
            x: 145,
            displayWidth: menuBackgroundWidth,
            textureKey: ImageKey.MenuBackground,
            origin: 0,
            scale: 2,
          }"
        />
        <DungeonsInputCursor
          :grid="PlayerOptionGrid"
          :position-map="CursorPositionMap"
          :tween="{
            delay: 0,
            repeat: -1,
            duration: dayjs.duration(0.5, 'seconds').asMilliseconds(),
            x: {
              from: INITIAL_CURSOR_POSITION.x,
              start: INITIAL_CURSOR_POSITION.x,
              to: INITIAL_CURSOR_POSITION.x + 3,
            },
          }"
        />
      </Container>
      <Text
        v-for="({ y }, index) in cursorPositions"
        :key="index"
        :configuration="{
          x: menuBackgroundWidth / 2,
          y: y - 1,
          text: PlayerOptionGrid.getValue(index),
          style: MenuTextStyle,
          origin: 0.5,
        }"
      />
    </Container>
  </Scene>
</template>
