import { usePhaserStore } from "@/lib/phaser/store/phaser";
import { NotInitializedError } from "@/models/error/NotInitializedError";
import { Game } from "phaser";

export const useGame = () => {
  const phaserStore = usePhaserStore();
  const { game } = storeToRefs(phaserStore);
  if (!game.value) throw new NotInitializedError(Game.name);
  return game.value as Game;
};
