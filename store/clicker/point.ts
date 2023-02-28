import { useGameStore } from "@/store/clicker/game";

export const usePointStore = defineStore("clicker/point", () => {
  const gameStore = useGameStore();
  const { game } = $(storeToRefs(gameStore));

  const incrementPoints = (points: number) => {
    game.noPoints += points;
  };
  const decrementPoints = (points: number) => {
    game.noPoints -= points;
  };
  return { incrementPoints, decrementPoints };
});
