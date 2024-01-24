<script setup lang="ts">
import Game from "@/lib/phaser/components/Game.vue";
import { GridEngine } from "grid-engine";
import { AUTO, Scale } from "phaser";
import VirtualJoystickPlugin from "phaser3-rex-plugins/plugins/virtualjoystick-plugin.js";

defineRouteRules({ ssr: false });
</script>

<template>
  <NuxtLayout>
    <Game
      :configuration="{
        title: 'Dungeons',
        type: AUTO,
        scale: {
          width: 1024,
          height: 576,
          mode: Scale.FIT,
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
          ],
        },
      }"
    >
      <DungeonsPreloaderScene />
      <DungeonsBattleScene />
    </Game>
  </NuxtLayout>
</template>
