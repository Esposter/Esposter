import { useGameStore } from "@/store/clicker/game";
import { clearInterval, setInterval } from "worker-timers";

export const useAutosaveTimer = () => {
  const gameStore = useGameStore();
  const { saveGame } = gameStore;
  let autosaveTimer = $ref<number>();

  onMounted(() => {
    autosaveTimer = setInterval(saveGame, AUTOSAVE_INTERVAL);
  });

  onUnmounted(() => {
    autosaveTimer && clearInterval(autosaveTimer);
  });
};
