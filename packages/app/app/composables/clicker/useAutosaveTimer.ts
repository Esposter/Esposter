import { AUTOSAVE_INTERVAL } from "@/services/clicker/constants";
import { useClickerStore } from "@/store/clicker";
import { clearInterval, setInterval } from "worker-timers";

export const useAutosaveTimer = () => {
  const clickerStore = useClickerStore();
  const { saveClicker } = clickerStore;
  const autosaveTimer = ref<number>();

  onMounted(() => {
    autosaveTimer.value = setInterval(saveClicker, AUTOSAVE_INTERVAL);
  });

  onUnmounted(() => {
    if (autosaveTimer.value) clearInterval(autosaveTimer.value);
  });
};
