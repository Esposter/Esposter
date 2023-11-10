import { GameScene } from "@/models/dungeons/scenes/GameScene";
import { PreloaderScene } from "@/models/dungeons/scenes/PreloaderScene";
import { SURFACE_DARK } from "@/services/vuetify/constants";
import { GridEngine } from "grid-engine";
import { AUTO, Game, Scale } from "phaser";
import VirtualJoystickPlugin from "phaser3-rex-plugins/plugins/virtualjoystick-plugin.js";

export const getPhaserGame = (containerId: string) =>
  new Game({
    title: "Dungeons",
    type: AUTO,
    parent: containerId,
    mode: Scale.FIT,
    autoCenter: Scale.CENTER_BOTH,
    scene: [PreloaderScene, GameScene],
    backgroundColor: SURFACE_DARK,
    input: {
      keyboard: true,
      touch: true,
    },
    plugins: {
      scene: [
        {
          key: "gridEngine",
          plugin: GridEngine,
          mapping: "gridEngine",
        },
        {
          key: "rexVirtualJoystick",
          plugin: VirtualJoystickPlugin,
          mapping: "rexVirtualJoystick",
        },
      ],
    },
  });
