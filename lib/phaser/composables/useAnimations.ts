import { onShutdown } from "@/lib/phaser/hooks/onShutdown";
import type { AnimationConfiguration } from "@/lib/phaser/models/configuration/shared/AnimationConfiguration";
import type { SceneWithPlugins } from "@/models/dungeons/scene/SceneWithPlugins";

export const useAnimations = (
  createConfigurations: (scene: SceneWithPlugins) => AnimationConfiguration["animations"],
) => {
  const animations = ref<AnimationConfiguration["animations"]>();

  onShutdown((scene) => {
    for (const { key } of createConfigurations(scene)) {
      if (!key) continue;
      scene.anims.remove(key);
    }
  });

  return animations;
};
