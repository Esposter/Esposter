import type { GridEngine } from "grid-engine";
import type SliderPlugin from "phaser3-rex-plugins/plugins/slider-plugin";
import type VirtualJoystickPlugin from "phaser3-rex-plugins/plugins/virtualjoystick-plugin";
import type { Constructor } from "type-fest";

export interface ScenePlugins {
  gridEngine: GridEngine;
  virtualJoystickPlugin: VirtualJoystickPlugin;
  sliderPlugin: SliderPlugin;
}

export const applyScenePluginsMixin = <TBase extends Constructor<NonNullable<unknown>>>(Base: TBase) =>
  class SceneWithMetadata extends Base implements ScenePlugins {
    gridEngine!: GridEngine;
    virtualJoystickPlugin!: VirtualJoystickPlugin;
    sliderPlugin!: SliderPlugin;
  };
