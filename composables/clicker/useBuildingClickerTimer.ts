import { useBuildingStore } from "@/store/clicker/building";
import { usePointStore } from "@/store/clicker/point";
import { clearInterval, setInterval } from "worker-timers";

export const useBuildingClickerTimer = () => {
  const pointStore = usePointStore();
  const { incrementPoints } = pointStore;
  const buildingStore = useBuildingStore();
  const { allBuildingPower } = $(storeToRefs(buildingStore));
  let buildingClickerTimer = $ref<number>();

  onMounted(() => {
    buildingClickerTimer = setInterval(() => incrementPoints(allBuildingPower / FPS), 1000 / FPS);
  });

  onUnmounted(() => {
    buildingClickerTimer && clearInterval(buildingClickerTimer);
  });
};
