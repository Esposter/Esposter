<script setup lang="ts">
import { FontKey } from "@/models/dungeons/keys/FontKey";
import { SceneKey } from "@/models/dungeons/keys/SceneKey";
import { SceneKeyMap } from "@/services/dungeons/scene/SceneKeyMap";
import { GridEngine } from "grid-engine";
import isMobile from "is-mobile";
import { AUTO, Scale } from "phaser";
import ClickOutsidePlugin from "phaser3-rex-plugins/plugins/clickoutside-plugin.js";
import SliderPlugin from "phaser3-rex-plugins/plugins/slider-plugin";
import VirtualJoystickPlugin from "phaser3-rex-plugins/plugins/virtualjoystick-plugin";
import { Game, usePhaserStore, useTextStore } from "vue-phaserjs";

defineRouteRules({ ssr: false });

await useReadDungeonsGame();

const phaserStore = usePhaserStore();
const { prioritizedParallelSceneKeys } = storeToRefs(phaserStore);
// Mobile joystick scene should always be the first to render
prioritizedParallelSceneKeys.value = [SceneKey.MobileJoystick];

const textStore = useTextStore();
const { defaultTextStyle } = storeToRefs(textStore);
defaultTextStyle.value = { fontFamily: FontKey.KenneyFutureNarrow };
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
      <component :is="component" v-for="[sceneKey, component] of Object.entries(SceneKeyMap)" :key="sceneKey" />
    </Game>
  </NuxtLayout>
</template>
