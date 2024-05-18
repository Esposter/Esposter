import { onShutdown } from "@/lib/phaser/hooks/onShutdown";
import type { SceneWithPlugins } from "@/models/dungeons/scene/SceneWithPlugins";
import type SliderPlugin from "phaser3-rex-plugins/plugins/slider-plugin";

export const useSlider = (scene: SceneWithPlugins, ...args: Parameters<SliderPlugin["add"]>) => {
  const slider = scene.sliderPlugin.add(...args);
  onShutdown(() => {
    slider.destroy();
  }, scene.scene.key);
  return slider;
};
