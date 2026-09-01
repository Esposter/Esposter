import type { SpritesheetKey } from "#shared/models/dungeons/keys/spritesheet/SpritesheetKey";
import type { SceneKey } from "@/models/dungeons/keys/SceneKey";
import type { TilesetKey } from "@/models/dungeons/keys/TilesetKey";
import type { GridEngine } from "grid-engine";
import type { Scene } from "phaser";
import type SliderPlugin from "phaser4-rex-plugins/plugins/slider-plugin";
import type VirtualJoystickPlugin from "phaser4-rex-plugins/plugins/virtualjoystick-plugin";

import "vue-phaserjs";

// `keyof (A | B)` is the keys A and B have in common, and these two share none — so this mapped type was
// Empty, and the augmentation below contributed nothing. It went unnoticed because the interface it augments
// Used to be `Record<string, string>`, which made every animation key `string` whatever this resolved to.
type BaseAnimationKeyMap = {
  [P in keyof typeof SpritesheetKey | keyof typeof TilesetKey]: P;
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
