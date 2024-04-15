import { InjectionKeyMap } from "@/lib/phaser/util/InjectionKeyMap";
import type { SceneWithPlugins } from "@/models/dungeons/scene/SceneWithPlugins";
import { NotInitializedError } from "@/models/error/NotInitializedError";
import { GameObjectType } from "@/models/error/dungeons/GameObjectType";

export const useInjectScene = () => {
  const scene = inject<SceneWithPlugins>(InjectionKeyMap.Scene);
  if (!scene) throw new NotInitializedError(GameObjectType.Scene);
  return scene;
};
