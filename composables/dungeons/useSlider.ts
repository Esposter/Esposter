import { usePhaserStore } from "@/lib/phaser/store/phaser";
import { BEFORE_DESTROY_SCENE_EVENT_KEY } from "@/lib/phaser/util/constants";
import type SliderPlugin from "phaser3-rex-plugins/plugins/slider-plugin";

export const useSlider = (...args: Parameters<SliderPlugin["add"]>) => {
  const phaserStore = usePhaserStore();
  const { scene, sceneKey } = storeToRefs(phaserStore);
  const slider = scene.value.sliderPlugin.add(...args);
  usePhaserListener(`${BEFORE_DESTROY_SCENE_EVENT_KEY}${sceneKey.value}`, slider.destroy);
};
