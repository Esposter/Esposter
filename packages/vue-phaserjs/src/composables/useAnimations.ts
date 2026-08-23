import type { SceneWithPlugins } from "#src/models/scene/SceneWithPlugins";
import type { Types } from "phaser";

import { useInjectSceneKey } from "#src/composables/useInjectSceneKey";
import { onNextTick } from "#src/hooks/onNextTick";
import { onShutdown } from "#src/hooks/onShutdown";
import { getScene } from "#src/util/getScene";
// Some animations (e.g. attacks) are short-lived and launched after scene creation, outside any
// Lifecycle hook, so we return the scene's created animation frames immediately.
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
