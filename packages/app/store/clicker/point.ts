import { useClickerStore } from "@/store/clicker";

export const usePointStore = defineStore("clicker/point", () => {
  const clickerStore = useClickerStore();
  const { game } = storeToRefs(clickerStore);
  const incrementPoints = (points: number) => {
    game.value.noPoints += points;
  };
  const decrementPoints = (points: number) => {
    game.value.noPoints -= points;
  };
  return { decrementPoints, incrementPoints };
});
