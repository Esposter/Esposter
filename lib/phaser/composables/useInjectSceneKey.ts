import { InjectionKeyMap } from "@/lib/phaser/util/InjectionKeyMap";
import type { SceneKey } from "@/models/dungeons/keys/SceneKey";
import { NotInitializedError } from "@esposter/shared";

export const useInjectSceneKey = () => {
  const sceneKey = inject<SceneKey>(InjectionKeyMap.SceneKey);
  if (!sceneKey) throw new NotInitializedError(InjectionKeyMap.SceneKey.description ?? "");
  return sceneKey;
};
