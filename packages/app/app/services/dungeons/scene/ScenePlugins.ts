import type { GridEngine } from "grid-engine";
import type SliderPlugin from "phaser4-rex-plugins/plugins/slider-plugin";
import type VirtualJoystickPlugin from "phaser4-rex-plugins/plugins/virtualjoystick-plugin";

export interface ScenePlugins {
  gridEngine: GridEngine;
  sliderPlugin: SliderPlugin;
  virtualJoystickPlugin: VirtualJoystickPlugin;
}
