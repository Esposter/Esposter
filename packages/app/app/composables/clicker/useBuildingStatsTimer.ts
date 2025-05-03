import type { BuildingWithStats } from "#shared/models/clicker/data/building/BuildingWithStats";
import type { Target } from "#shared/models/clicker/data/Target";

import { dayjs } from "#shared/services/dayjs";
import { FPS } from "@/services/clicker/constants";
import { useClickerStore } from "@/store/clicker";
import { useBuildingStore } from "@/store/clicker/building";
import { clearInterval, setInterval } from "worker-timers";

export const useBuildingStatsTimer = () => {
  const clickerStore = useClickerStore();
  const { clicker } = storeToRefs(clickerStore);
  const buildingStore = useBuildingStore();
  const { getBoughtBuildingPower } = buildingStore;
  const boughtBuildingPowers = computed<{ id: Target; power: number }[]>(() =>
    clicker.value.boughtBuildings.map((b) => ({ id: b.id, power: getBoughtBuildingPower(b) })),
  );
  const buildingStatsTimers = ref<number[]>([]);

  const setBuildingStatsTimers = (
    boughtBuildings: BuildingWithStats[],
    buildingPowers: typeof boughtBuildingPowers.value,
  ) => {
    for (const boughtBuilding of boughtBuildings) {
      const buildingPower = buildingPowers.find(({ id }) => id === boughtBuilding.id);
      if (!buildingPower) return;

      buildingStatsTimers.value.push(
        setInterval(
          () => {
            boughtBuilding.producedValue += buildingPower.power / FPS;
          },
          dayjs.duration(1, "second").asMilliseconds() / FPS,
        ),
      );
    }
  };

  onMounted(() => {
    setBuildingStatsTimers(clicker.value.boughtBuildings, boughtBuildingPowers.value);
  });

  onUnmounted(() => {
    for (const buildingStatsTimer of buildingStatsTimers.value) clearInterval(buildingStatsTimer);
  });

  watch([() => clicker.value.boughtBuildings, boughtBuildingPowers], ([boughtBuildings, boughtBuildingPowers]) => {
    for (const buildingStatsTimer of buildingStatsTimers.value) clearInterval(buildingStatsTimer);
    buildingStatsTimers.value = [];
    setBuildingStatsTimers(boughtBuildings, boughtBuildingPowers);
  });
};
