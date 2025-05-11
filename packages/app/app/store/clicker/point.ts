import { useClickerStore } from "@/store/clicker";

export const usePointStore = defineStore("clicker/point", () => {
  const clickerStore = useClickerStore();
  const incrementPoints = (points: number) => {
    clickerStore.clicker.noPoints += points;
  };
  const decrementPoints = (points: number) => {
    clickerStore.clicker.noPoints -= points;
  };
  return { decrementPoints, incrementPoints };
});
