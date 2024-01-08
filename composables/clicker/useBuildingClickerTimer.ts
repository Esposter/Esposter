import { FPS } from "@/services/clicker/constants";
import { useBuildingStore } from "@/store/clicker/building";
import { usePointStore } from "@/store/clicker/point";
import dayjs from "dayjs";
import { clearInterval, setInterval } from "worker-timers";

export const useBuildingClickerTimer = () => {
  const pointStore = usePointStore();
  const { incrementPoints } = pointStore;
  const buildingStore = useBuildingStore();
  const { allBuildingPower } = storeToRefs(buildingStore);
  const buildingClickerTimer = ref<number>();

  onMounted(() => {
    buildingClickerTimer.value = setInterval(
      () => incrementPoints(allBuildingPower.value / FPS),
      dayjs.duration(1, "second").milliseconds() / FPS,
    );
  });

  onUnmounted(() => {
    buildingClickerTimer.value && clearInterval(buildingClickerTimer.value);
  });
};
