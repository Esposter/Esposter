import { dayjs } from "#shared/services/dayjs";
import { MIN_OFFLINE_DIALOG_ELAPSED, OFFLINE_CAP, OFFLINE_RATE } from "@/services/clicker/constants";
import { useClickerStore } from "@/store/clicker";
import { useBuildingStore } from "@/store/clicker/building";
import { usePointStore } from "@/store/clicker/point";

export const useOfflineProgressStore = defineStore("clicker/offlineProgress", () => {
  const clickerStore = useClickerStore();
  const buildingStore = useBuildingStore();
  const { getBoughtBuildingPower } = buildingStore;
  const pointStore = usePointStore();
  const { incrementPoints } = pointStore;
  const awardedPoints = ref(0);
  const elapsedMs = ref(0);
  // Awards capped production for the time elapsed since the save was last stamped.
  // Guard elapsed > 0 against clock skew; the dialog is skipped for absences under a minute.
  const applyOfflineProgress = () => {
    const newElapsedMs = Date.now() - clickerStore.clicker.updatedAt.getTime();
    if (newElapsedMs <= 0) return;

    const cappedSeconds = dayjs.duration(Math.min(newElapsedMs, OFFLINE_CAP)).asSeconds();
    const newAwardedPoints = buildingStore.allBuildingPower * cappedSeconds * OFFLINE_RATE;
    if (newAwardedPoints <= 0) return;

    incrementPoints(newAwardedPoints);
    for (const boughtBuilding of clickerStore.clicker.boughtBuildings)
      boughtBuilding.producedValue += getBoughtBuildingPower(boughtBuilding) * cappedSeconds * OFFLINE_RATE;

    if (newElapsedMs < MIN_OFFLINE_DIALOG_ELAPSED) return;

    awardedPoints.value = newAwardedPoints;
    elapsedMs.value = newElapsedMs;
  };
  return { applyOfflineProgress, awardedPoints, elapsedMs };
});
