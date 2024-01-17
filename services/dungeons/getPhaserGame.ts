import { BattleScene } from "@/models/dungeons/scenes/BattleScene";
import { GameScene } from "@/models/dungeons/scenes/GameScene";
import { PreloaderScene } from "@/models/dungeons/scenes/PreloaderScene";
import { GridEngine } from "grid-engine";
import { AUTO, Game, Scale } from "phaser";
import VirtualJoystickPlugin from "phaser3-rex-plugins/plugins/virtualjoystick-plugin.js";

export const getPhaserGame = (containerId: string) =>
  new Game({
    title: "Dungeons",
    type: AUTO,
    scale: {
      parent: containerId,
      width: 1024,
      height: 576,
      mode: Scale.FIT,
      autoCenter: Scale.CENTER_BOTH,
    },
    scene: [PreloaderScene, GameScene, BattleScene],
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
          key: "virtualJoystickPlugin",
          plugin: VirtualJoystickPlugin,
          mapping: "virtualJoystickPlugin",
        },
      ],
    },
  });
