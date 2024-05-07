import { onNextTick } from "@/lib/phaser/hooks/onNextTick";
import { onShutdown } from "@/lib/phaser/hooks/onShutdown";
import type { AnimationConfiguration } from "@/lib/phaser/models/configuration/shared/AnimationConfiguration";
import type { SceneWithPlugins } from "@/models/dungeons/scene/SceneWithPlugins";

export const useAnimations = (
  createConfigurations: (scene: SceneWithPlugins) => AnimationConfiguration["animations"],
) => {
  const animations = ref<AnimationConfiguration["animations"]>([]);

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
