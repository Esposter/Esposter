import type GridEngine from "grid-engine";
import { Scene, type Types } from "phaser";
import type VirtualJoystickPlugin from "phaser3-rex-plugins/plugins/virtualjoystick-plugin";

export class SceneWithPlugins extends Scene {
  gridEngine!: GridEngine;
  virtualJoystickPlugin!: VirtualJoystickPlugin;

  constructor(config?: string | Types.Scenes.SettingsConfig) {
    super(config);
  }
}
