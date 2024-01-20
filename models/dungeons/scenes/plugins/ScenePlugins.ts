import { type Constructor } from "@/util/types/Constructor";
import type GridEngine from "grid-engine";
import type VirtualJoystickPlugin from "phaser3-rex-plugins/plugins/virtualjoystick-plugin";

export interface ScenePlugins {
  gridEngine: GridEngine;
  virtualJoystickPlugin: VirtualJoystickPlugin;
}

export const applyScenePluginsMixin = <TBase extends Constructor<{}>>(Base: TBase) =>
  class SceneWithMetadata extends Base implements ScenePlugins {
    gridEngine!: GridEngine;
    virtualJoystickPlugin!: VirtualJoystickPlugin;
  };
