import type { SceneWithPlugins } from "#src/models/scene/SceneWithPlugins";
import type { Types } from "phaser";

import { useInjectSceneKey } from "#src/composables/useInjectSceneKey";
import { onNextTick } from "#src/hooks/onNextTick";
import { onShutdown } from "#src/hooks/onShutdown";
import { getScene } from "#src/services/shared/getScene";

// Some animations (e.g. attacks) are short-lived and launched after scene creation, outside any
// Lifecycle hook, so we return the scene's created animation frames immediately.
export const useAnimations = (
  createConfigurations: (scene: SceneWithPlugins) => Types.Animations.Animation[],
  immediate?: true,
) => {
  const animations = ref<Types.Animations.Animation[]>([]);
  let animationScene: SceneWithPlugins | undefined;
  const createAnimations = (scene: SceneWithPlugins) => {
    animationScene = scene;
    animations.value = createConfigurations(scene);
  };
  // The scene's animation manager keeps the frames, so they are removed on shutdown or on unmount, whichever comes first
  const removeAnimations = () => {
    if (!animationScene) return;

    for (const { key } of animations.value) {
      if (!key) continue;
      animationScene.anims.remove(key);
    }
  };

  if (immediate) {
    const sceneKey = useInjectSceneKey();
    createAnimations(getScene(sceneKey));
  } else onNextTick(createAnimations);

  const removeShutdownListener = onShutdown(removeAnimations);
  onUnmounted(() => {
    removeShutdownListener();
    removeAnimations();
  });

  return animations;
};
