import { useClickerStore } from "#src/store/clicker/index";

export const usePointStore = defineStore("clicker/point", () => {
  const clickerStore = useClickerStore();
  // The one reading of whether a price can be paid: the rows colour their price by it and the buttons disable on it
  const checkIsAffordable = (price: number) => clickerStore.clicker.pointCount >= price;
  const incrementPoints = (points: number) => {
    clickerStore.clicker.pointCount += points;
  };
  // The only way points leave. It reads the same check again, so a purchase that forgot to disable still cannot
  // Spend points the player lacks
  const trySpendPoints = (price: number) => {
    if (!checkIsAffordable(price)) return false;

    clickerStore.clicker.pointCount -= price;
    return true;
  };
  return { checkIsAffordable, incrementPoints, trySpendPoints };
});
