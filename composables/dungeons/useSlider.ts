import { onShutdown } from "@/lib/phaser/hooks/onShutdown";
import { usePhaserStore } from "@/lib/phaser/store/phaser";
import type SliderPlugin from "phaser3-rex-plugins/plugins/slider-plugin";

export const useSlider = (...args: Parameters<SliderPlugin["add"]>) => {
  const phaserStore = usePhaserStore();
  const { scene } = storeToRefs(phaserStore);
  const slider = scene.value.sliderPlugin.add(...args);

  onShutdown(() => {
    slider.destroy();
  });

  return slider;
};
