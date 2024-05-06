import { InjectionKeyMap } from "@/lib/phaser/util/InjectionKeyMap";
import { NotInitializedError } from "@/models/error/NotInitializedError";
import type { Game } from "phaser";

export const useInjectGame = () => {
  const game = inject<Game>(InjectionKeyMap.Game);
  if (!game) throw new NotInitializedError(InjectionKeyMap.Game.description ?? "");
  return game;
};
