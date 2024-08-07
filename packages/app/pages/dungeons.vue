<script setup lang="ts">
import Game from "@/lib/phaser/components/Game.vue";
import { SceneKeyMap } from "@/services/dungeons/scene/SceneKeyMap";
import { GridEngine } from "grid-engine";
import isMobile from "is-mobile";
import { AUTO, Scale } from "phaser";
import ClickOutsidePlugin from "phaser3-rex-plugins/plugins/clickoutside-plugin.js";
import SliderPlugin from "phaser3-rex-plugins/plugins/slider-plugin";
import VirtualJoystickPlugin from "phaser3-rex-plugins/plugins/virtualjoystick-plugin";

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
          // We need to support multi-touch for mobile joystick
          // https://phaser.discourse.group/t/how-to-enable-multitouch-jsfiddle-inside/2422
          activePointers: isMobile() ? 3 : 2,
        },
        plugins: {
          global: [
            {
              key: 'clickOutsidePlugin',
              plugin: ClickOutsidePlugin,
              start: true,
            },
          ],
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

<style scoped lang="scss">
@font-face {
  font-family: "KenneyFutureNarrow";
  src: local("KenneyFutureNarrow"), url("/fonts/KenneyFutureNarrow.woff2"), format(woff2);
}
</style>
