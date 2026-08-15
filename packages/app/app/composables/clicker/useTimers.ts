import { applyGameTick } from "@/services/clicker/applyGameTick";
import { AUTOSAVE_INTERVAL, GAME_TICK_INTERVAL } from "@/services/clicker/constants";
import { useClickerStore } from "@/store/clicker";

export const useTimers = () => {
  const clickerStore = useClickerStore();
  const { saveClicker } = clickerStore;
  const { clicker } = storeToRefs(clickerStore);

  useWorkerInterval(saveClicker, AUTOSAVE_INTERVAL);
  useWorkerInterval(() => {
    applyGameTick(clicker.value);
  }, GAME_TICK_INTERVAL);
};
