import { useGameStore } from "@/store/clicker/useGameStore";

export const usePointStore = defineStore("clicker/point", () => {
  const gameStore = useGameStore();
  const incrementPoints = (points: number) => {
    gameStore.game.noPoints += points;
  };
  const decrementPoints = (points: number) => {
    gameStore.game.noPoints -= points;
  };
  return { incrementPoints, decrementPoints };
});
