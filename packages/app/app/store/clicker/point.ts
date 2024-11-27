import { useClickerStore } from "@/store/clicker";

export const usePointStore = defineStore("clicker/point", () => {
  const clickerStore = useClickerStore();
  const incrementPoints = (points: number) => {
    clickerStore.game.noPoints += points;
  };
  const decrementPoints = (points: number) => {
    clickerStore.game.noPoints -= points;
  };
  return { decrementPoints, incrementPoints };
});
