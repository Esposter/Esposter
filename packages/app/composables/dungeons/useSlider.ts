import type SliderPlugin from "phaser3-rex-plugins/plugins/slider-plugin";
import type { SceneWithPlugins } from "vue-phaser";

import { onShutdown } from "vue-phaser";

export const useSlider = (scene: SceneWithPlugins, ...args: Parameters<SliderPlugin["add"]>) => {
  const slider = scene.sliderPlugin.add(...args);
  onShutdown(() => {
    slider.destroy();
  }, scene.scene.key);
  return slider;
};
