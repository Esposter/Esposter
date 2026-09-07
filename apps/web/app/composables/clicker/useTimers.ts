import { applyGameTick } from "@/services/clicker/applyGameTick";
import { AUTOSAVE_INTERVAL_MS, GAME_TICK_INTERVAL_MS } from "@/services/clicker/constants";
import { useClickerStore } from "@/store/clicker";
import { getResultAsync, noop } from "@esposter/shared";

export const useTimers = () => {
  const clickerStore = useClickerStore();
  const { saveClicker } = clickerStore;
  const { clicker } = storeToRefs(clickerStore);
  // The tick is a fire-and-forget schedule with nothing to await it, so the save terminates its own result —
  // A failed autosave is logged and the next tick tries again
  useWorkerInterval(() => {
    // oxlint-disable-next-line typescript/no-floating-promises -- match() handles both branches, so the promise it returns cannot reject and a tick has nothing to await it
    getResultAsync(() => saveClicker()).match(noop, console.error);
  }, AUTOSAVE_INTERVAL_MS);
  useWorkerInterval(() => {
    applyGameTick(clicker.value);
  }, GAME_TICK_INTERVAL_MS);
};
