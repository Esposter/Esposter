<script setup lang="ts">
import { FontKey } from "#shared/models/dungeons/keys/FontKey";
import { SceneKey } from "#shared/models/dungeons/keys/SceneKey";
import { SceneKeyMap } from "@/services/dungeons/scene/SceneKeyMap";
import { GridEngine } from "grid-engine";
import isMobile from "is-mobile";
import * as PhaserLib from "phaser";
import { AUTO, Scale } from "phaser";
import ClickOutsidePlugin from "phaser4-rex-plugins/plugins/clickoutside-plugin.js";
import SliderPlugin from "phaser4-rex-plugins/plugins/slider-plugin";
import VirtualJoystickPlugin from "phaser4-rex-plugins/plugins/virtualjoystick-plugin";
import { Game, usePhaserStore, useTextStore } from "vue-phaserjs";
// @TODO: grid-engine references the global Phaser object; Phaser 4 ESM doesn't set it automatically
(globalThis as Record<string, unknown>).Phaser = PhaserLib;

defineRouteRules({ ssr: false });

await useReadDungeons();

const phaserStore = usePhaserStore();
const { prioritizedParallelSceneKeys } = storeToRefs(phaserStore);
// Mobile joystick scene should always be the first to render
prioritizedParallelSceneKeys.value = [SceneKey.MobileJoystick];

const textStore = useTextStore();
const { defaultTextStyle } = storeToRefs(textStore);
defaultTextStyle.value = { fontFamily: FontKey.KenneyFutureNarrow };
</script>

<template>
  <NuxtLayout hide-global-scrollbar>
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
