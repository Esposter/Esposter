import { AUTOSAVE_INTERVAL } from "@/services/clicker/constants";
import { useClickerStore } from "@/store/clicker";
import { clearInterval, setInterval } from "worker-timers";

export const useAutosaveTimer = () => {
  const clickerStore = useClickerStore();
  const { saveGame } = clickerStore;
  const autosaveTimer = ref<number>();

  onMounted(() => {
    autosaveTimer.value = setInterval(saveGame, AUTOSAVE_INTERVAL);
  });

  onUnmounted(() => {
    autosaveTimer.value && clearInterval(autosaveTimer.value);
  });
};
