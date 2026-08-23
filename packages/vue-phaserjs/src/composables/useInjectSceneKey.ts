import type { SceneWithPlugins } from "#src/models/scene/SceneWithPlugins";

import { InjectionKeyMap } from "#src/util/InjectionKeyMap";
import { NotInitializedError } from "@esposter/shared";
// We need to define the return type manually so it doesn't get lost after the inject
export const useInjectSceneKey = (): SceneWithPlugins["scene"]["key"] => {
  const sceneKey = inject(InjectionKeyMap.SceneKey);
  if (!sceneKey) throw new NotInitializedError(InjectionKeyMap.SceneKey.description ?? "");
  return sceneKey;
};
