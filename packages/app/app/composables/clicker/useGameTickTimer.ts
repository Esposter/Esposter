import { dayjs } from "#shared/services/dayjs";
import { applyGameTick } from "@/services/clicker/applyGameTick";
import { FPS } from "@/services/clicker/constants";
import { useClickerStore } from "@/store/clicker";
import { clearInterval, setInterval } from "worker-timers";

export const useGameTickTimer = () => {
  const clickerStore = useClickerStore();
  const { clicker } = storeToRefs(clickerStore);
  const gameTickTimer = ref<number>();

  onMounted(() => {
    gameTickTimer.value = setInterval(
      () => {
        applyGameTick(clicker.value);
      },
      dayjs.duration(1, "second").asMilliseconds() / FPS,
    );
  });

  onUnmounted(() => {
    if (gameTickTimer.value) clearInterval(gameTickTimer.value);
  });
};
