import type { BuildingWithStats } from "@/models/clicker/data/building/BuildingWithStats";
import type { Target } from "@/models/clicker/data/Target";

import { FPS } from "@/services/clicker/constants";
import { dayjs } from "@/shared/services/dayjs";
import { useClickerStore } from "@/store/clicker";
import { useBuildingStore } from "@/store/clicker/building";
import { clearInterval, setInterval } from "worker-timers";

export const useBuildingStatsTimer = () => {
  const clickerStore = useClickerStore();
  const { game } = storeToRefs(clickerStore);
  const buildingStore = useBuildingStore();
  const { getBoughtBuildingPower } = buildingStore;
  const boughtBuildingPowers = computed<{ id: Target; power: number }[]>(() =>
    game.value.boughtBuildings.map((b) => ({ id: b.id, power: getBoughtBuildingPower(b) })),
  );
  const buildingStatsTimers = ref<number[]>([]);

  const setBuildingStatsTimers = (
    boughtBuildings: BuildingWithStats[],
    buildingPowers: typeof boughtBuildingPowers.value,
  ) => {
    for (const boughtBuilding of boughtBuildings) {
      const buildingPower = buildingPowers.find((b) => b.id === boughtBuilding.id);
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
    setBuildingStatsTimers(game.value.boughtBuildings, boughtBuildingPowers.value);
  });

  onUnmounted(() => {
    for (const buildingStatsTimer of buildingStatsTimers.value) clearInterval(buildingStatsTimer);
  });

  watch([() => game.value.boughtBuildings, boughtBuildingPowers], ([boughtBuildings, boughtBuildingPowers]) => {
    for (const buildingStatsTimer of buildingStatsTimers.value) clearInterval(buildingStatsTimer);
    buildingStatsTimers.value = [];
    setBuildingStatsTimers(boughtBuildings, boughtBuildingPowers);
  });
};
