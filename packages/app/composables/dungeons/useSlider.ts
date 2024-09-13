import type SliderPlugin from "phaser3-rex-plugins/plugins/slider-plugin";
import type { SceneWithPlugins } from "vue-phaserjs";

import { onShutdown } from "vue-phaserjs";

export const useSlider = (scene: SceneWithPlugins, ...args: Parameters<SliderPlugin["add"]>) => {
  const slider = scene.sliderPlugin.add(...args);
  onShutdown(() => {
    slider.destroy();
  }, scene.scene.key);
  return slider;
};
