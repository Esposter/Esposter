<script setup lang="ts">
import Game from "@/lib/phaser/components/Game.vue";
import { BattleScene } from "@/models/dungeons/scenes/BattleScene";
import { GameScene } from "@/models/dungeons/scenes/GameScene";
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
        scene: [GameScene, BattleScene],
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
    </Game>
  </NuxtLayout>
</template>
