import type { SpritesheetKey } from "@/models/dungeons/keys/spritesheet/SpritesheetKey";
import type { TilesetKey } from "@/models/dungeons/keys/TilesetKey";
import type { GridEngine } from "grid-engine";
import type SliderPlugin from "phaser3-rex-plugins/plugins/slider-plugin";
import type VirtualJoystickPlugin from "phaser3-rex-plugins/plugins/virtualjoystick-plugin";

import "vue-phaser";

declare module "vue-phaser" {
  interface ScenePlugins {
    gridEngine: GridEngine;
    sliderPlugin: SliderPlugin;
    virtualJoystickPlugin: VirtualJoystickPlugin;
  }

  interface AnimationKey extends SpritesheetKey, TilesetKey {}
}
