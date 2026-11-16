import { applyGameTick } from "#src/services/clicker/applyGameTick";
import { AUTOSAVE_INTERVAL_MS, GAME_TICK_INTERVAL_MS } from "#src/services/clicker/constants";
import { useClickerStore } from "#src/store/clicker/index";

export const useTimers = () => {
  const clickerStore = useClickerStore();
  const { saveClicker } = clickerStore;
  const { clicker } = storeToRefs(clickerStore);
  // A failed autosave is reported by the save itself, and the next tick tries again
  useWorkerInterval(() => {
    saveClicker();
  }, AUTOSAVE_INTERVAL_MS);
  useWorkerInterval(() => {
    applyGameTick(clicker.value);
  }, GAME_TICK_INTERVAL_MS);
};
