import type { SceneWithPlugins } from "@/models/scene/SceneWithPlugins";

import { InjectionKeyMap } from "@/utils/InjectionKeyMap";
import { NotInitializedError } from "@esposter/shared";

export const useInjectSceneKey = () => {
  const sceneKey = inject<SceneWithPlugins["scene"]["key"]>(InjectionKeyMap.SceneKey);
  if (!sceneKey) throw new NotInitializedError(InjectionKeyMap.SceneKey.description ?? "");
  return sceneKey;
};
