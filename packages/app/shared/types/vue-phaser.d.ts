import type { SceneKey } from "#shared/models/dungeons/keys/SceneKey";
import type { SpritesheetKey } from "#shared/models/dungeons/keys/spritesheet/SpritesheetKey";
import type { TilesetKey } from "#shared/models/dungeons/keys/TilesetKey";
import type { GridEngine } from "grid-engine";
import type { Scene } from "phaser";
import type SliderPlugin from "phaser3-rex-plugins/plugins/slider-plugin";
import type VirtualJoystickPlugin from "phaser3-rex-plugins/plugins/virtualjoystick-plugin";

import "vue-phaserjs";

type BaseAnimationKeyMap = {
  [P in keyof (typeof SpritesheetKey | typeof TilesetKey)]: P;
};

declare module "vue-phaserjs" {
  interface AnimationKeyMap extends BaseAnimationKeyMap {}

  interface ScenePlugins {
    gridEngine: GridEngine;
    sliderPlugin: SliderPlugin;
    virtualJoystickPlugin: VirtualJoystickPlugin;
  }

  interface SceneWithPlugins {
    scene: Scene["scene"] & { key: SceneKey };
  }
}
