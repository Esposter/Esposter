import { useInjectSceneKey } from "@/lib/phaser/composables/useInjectSceneKey";
import { onNextTick } from "@/lib/phaser/hooks/onNextTick";
import { onShutdown } from "@/lib/phaser/hooks/onShutdown";
import { getScene } from "@/lib/phaser/util/getScene";
import type { SceneWithPlugins } from "@/models/dungeons/scene/SceneWithPlugins";
import type { Types } from "phaser";
// Some animations e.g. attacks may exist only for a very short time before they disappear
// and are launched after the scene is created, outside of any lifecycle hooks
// so we want to allow returning the animations frames created by the scene immediately
export const useAnimations = (
  createConfigurations: (scene: SceneWithPlugins) => Types.Animations.Animation[],
  immediate?: true,
) => {
  if (immediate) {
    const sceneKey = useInjectSceneKey();
    const scene = getScene(sceneKey);
    return createConfigurations(scene);
  }

  const animations = ref<Types.Animations.Animation[]>([]);

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
