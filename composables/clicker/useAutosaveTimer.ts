import { AUTOSAVE_INTERVAL } from "@/services/clicker/settings";
import { useGameStore } from "@/store/clicker/game";
import { clearInterval, setInterval } from "worker-timers";

export const useAutosaveTimer = () => {
  const gameStore = useGameStore();
  const { saveGame } = gameStore;
  const autosaveTimer = ref<number>();

  onMounted(() => {
    autosaveTimer.value = setInterval(saveGame, AUTOSAVE_INTERVAL);
  });

  onUnmounted(() => {
    autosaveTimer.value && clearInterval(autosaveTimer.value);
  });
};
