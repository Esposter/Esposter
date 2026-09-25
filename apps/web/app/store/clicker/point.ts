import { useClickerStore } from "@/store/clicker";

export const usePointStore = defineStore("clicker/point", () => {
  const clickerStore = useClickerStore();
  // The one reading of whether a price can be paid: the rows colour their price by it, the buttons disable on it, and
  // A purchase refuses without it, so a button that forgot to disable still cannot spend points the player lacks
  const checkIsAffordable = (price: number) => clickerStore.clicker.pointCount >= price;
  const incrementPoints = (points: number) => {
    clickerStore.clicker.pointCount += points;
  };
  const decrementPoints = (points: number) => {
    clickerStore.clicker.pointCount -= points;
  };
  return { checkIsAffordable, decrementPoints, incrementPoints };
});
