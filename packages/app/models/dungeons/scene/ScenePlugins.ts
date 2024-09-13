import type { GridEngine } from "grid-engine";
import type SliderPlugin from "phaser3-rex-plugins/plugins/slider-plugin";
import type VirtualJoystickPlugin from "phaser3-rex-plugins/plugins/virtualjoystick-plugin";

export interface ScenePlugins {
  gridEngine: GridEngine;
  sliderPlugin: SliderPlugin;
  virtualJoystickPlugin: VirtualJoystickPlugin;
}
