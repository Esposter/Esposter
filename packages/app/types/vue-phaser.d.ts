import type { SceneKey } from "@/models/dungeons/keys/SceneKey";
import type { SpritesheetKey } from "@/models/dungeons/keys/spritesheet/SpritesheetKey";
import type { TilesetKey } from "@/models/dungeons/keys/TilesetKey";
import type { GridEngine } from "grid-engine";
import type { Scene } from "phaser";
import type SliderPlugin from "phaser3-rex-plugins/plugins/slider-plugin";
import type VirtualJoystickPlugin from "phaser3-rex-plugins/plugins/virtualjoystick-plugin";

import "vue-phaserjs";

type BaseAnimationKeyMap = {
  [P in keyof typeof SpritesheetKey | keyof typeof TilesetKey]: P;
};

declare module "vue-phaserjs" {
  interface ScenePlugins {
    gridEngine: GridEngine;
    sliderPlugin: SliderPlugin;
    virtualJoystickPlugin: VirtualJoystickPlugin;
  }

  interface SceneWithPlugins {
    scene: { key: SceneKey } & Scene["scene"];
  }

  interface AnimationKeyMap extends BaseAnimationKeyMap {}
}