import { usePhaserStore } from "@/lib/phaser/store";
import { Game } from "phaser";
import { NotInitializedError } from "~/packages/shared/models/error/NotInitializedError";

export const useGame = () => {
  const phaserStore = usePhaserStore();
  const { game } = storeToRefs(phaserStore);
  if (!game.value) throw new NotInitializedError(Game.name);
  return game.value as Game;
};
