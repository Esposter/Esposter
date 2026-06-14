import type { SceneWithPlugins } from "@/models/scene/SceneWithPlugins";
import type { Types } from "phaser";

import { useInjectSceneKey } from "@/composables/useInjectSceneKey";
import { onNextTick } from "@/hooks/onNextTick";
import { onShutdown } from "@/hooks/onShutdown";
import { getScene } from "@/util/getScene";
// Some animations (e.g. attacks) are short-lived and launched after scene creation, outside any
// lifecycle hook, so we return the scene's created animation frames immediately.
export const useAnimations = (
  createConfigurations: (scene: SceneWithPlugins) => Types.Animations.Animation[],
  immediate?: true,
) => {
  const animations = ref<Types.Animations.Animation[]>([]);

  if (immediate) {
    const sceneKey = useInjectSceneKey();
    const scene = getScene(sceneKey);
    animations.value = createConfigurations(scene);
  } else
    onNextTick((scene) => {
      animations.value = createConfigurations(scene);
    });

  onShutdown((scene) => {
    for (const { key } of animations.value) {
      if (!key) continue;
      scene.anims.remove(key);
    }
  });

  return animations;
};
