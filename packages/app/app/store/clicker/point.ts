import { useClickerStore } from "@/store/clicker";

export const usePointStore = defineStore("clicker/point", () => {
  const clickerStore = useClickerStore();
  const incrementPoints = (points: number) => {
    clickerStore.clicker.pointCount += points;
  };
  const decrementPoints = (points: number) => {
    clickerStore.clicker.pointCount -= points;
  };
  return { decrementPoints, incrementPoints };
});
