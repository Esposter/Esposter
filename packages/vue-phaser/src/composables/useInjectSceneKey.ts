import type { SceneKey } from "@/models/keys/SceneKey";

import { InjectionKeyMap } from "@/utils/InjectionKeyMap";
import { NotInitializedError } from "@esposter/shared";

export const useInjectSceneKey = () => {
  const sceneKey = inject<SceneKey>(InjectionKeyMap.SceneKey);
  if (!sceneKey) throw new NotInitializedError(InjectionKeyMap.SceneKey.description ?? "");
  return sceneKey;
};
