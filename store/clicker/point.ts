import { useGameStore } from "@/store/clicker/game";

export const usePointStore = defineStore("clicker/point", () => {
  const gameStore = useGameStore();
  const { game } = storeToRefs(gameStore);

  const incrementPoints = (points: number) => {
    if (!game.value) return;
    game.value.noPoints += points;
  };
  const decrementPoints = (points: number) => {
    if (!game.value) return;
    game.value.noPoints -= points;
  };
  return { incrementPoints, decrementPoints };
});
