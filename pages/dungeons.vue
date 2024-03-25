<script setup lang="ts">
import Game from "@/lib/phaser/components/Game.vue";
import { GridEngine } from "grid-engine";
import { AUTO, Scale } from "phaser";
import SliderPlugin from "phaser3-rex-plugins/plugins/slider-plugin";
import VirtualJoystickPlugin from "phaser3-rex-plugins/plugins/virtualjoystick-plugin";
import { SceneKeyMap } from "@/services/dungeons/SceneKeyMap";

defineRouteRules({ ssr: false });

await useReadDungeonsGame();
</script>

<template>
  <NuxtLayout :main-style="{ maxHeight: '100dvh' }">
    <Game
      :configuration="{
        title: 'Dungeons',
        type: AUTO,
        scale: {
          width: 1024,
          height: 576,
          mode: Scale.ScaleModes.FIT,
          autoCenter: Scale.CENTER_BOTH,
        },
        input: {
          keyboard: true,
          touch: true,
        },
        plugins: {
          scene: [
            {
              key: 'gridEngine',
              plugin: GridEngine,
              mapping: 'gridEngine',
            },
            {
              key: 'virtualJoystickPlugin',
              plugin: VirtualJoystickPlugin,
              mapping: 'virtualJoystickPlugin',
            },
            {
              key: 'sliderPlugin',
              plugin: SliderPlugin,
              mapping: 'sliderPlugin',
            },
          ],
        },
      }"
    >
      <component :is="component" v-for="[sceneKey, component] in Object.entries(SceneKeyMap)" :key="sceneKey" />
    </Game>
  </NuxtLayout>
</template>
