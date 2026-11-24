import type { SceneWithPlugins } from "#src/models/scene/SceneWithPlugins";

import { InjectionKeyMap } from "#src/services/shared/InjectionKeyMap";
import { NotInitializedError } from "@esposter/shared";

// We need to define the return type manually so it doesn't get lost after the inject
export const useInjectSceneKey = (): SceneWithPlugins["scene"]["key"] => {
  // oxlint-disable-next-line no-restricted-globals -- a game object under a Scene belongs to it
  const sceneKey = inject(InjectionKeyMap.SceneKey);
  if (!sceneKey) throw new NotInitializedError(InjectionKeyMap.SceneKey.description ?? "");
  return sceneKey;
};
