import { SceneKey } from "@/models/dungeons/keys/SceneKey";
import { NotInitializedError } from "@/models/error/NotInitializedError";
import { GameObjectType } from "@/models/error/dungeons/GameObjectType";
import type { Game } from "phaser";

export const validate = (game: object | null, hookName: string) => {
  if (!game) throw new NotInitializedError(GameObjectType.Game);
  else if ((game as Game).scene.scenes.length !== Object.keys(SceneKey).length)
    throw new Error(
      `
      ${hookName} has been incorrectly called when all the scenes in the game have not been initialized yet.
      If you have called ${hookName} in a root scene component that renders <Scene /> from the vue-phaser library,
      please call ${hookName} in the event emitters provided by <Scene /> instead and pass in the scene key.`,
    );
};
