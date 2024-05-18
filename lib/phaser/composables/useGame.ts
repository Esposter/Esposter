import { usePhaserStore } from "@/lib/phaser/store";
import { NotInitializedError } from "@esposter/shared";
import { Game } from "phaser";

export const useGame = () => {
  const phaserStore = usePhaserStore();
  const { game } = storeToRefs(phaserStore);
  if (!game.value) throw new NotInitializedError(Game.name);
  return game.value as Game;
};
