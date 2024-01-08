import { type BuildingWithStats } from "@/models/clicker/BuildingWithStats";
import { type Target } from "@/models/clicker/Target";
import { FPS } from "@/services/clicker/constants";
import { useBuildingStore } from "@/store/clicker/building";
import { useGameStore } from "@/store/clicker/game";
import dayjs from "dayjs";
import { clearInterval, setInterval } from "worker-timers";

export const useBuildingStatsTimer = () => {
  const gameStore = useGameStore();
  const { game } = storeToRefs(gameStore);
  const buildingStore = useBuildingStore();
  const { getBoughtBuildingPower } = buildingStore;
  const boughtBuildingPowers = computed<{ name: Target; power: number }[]>(() =>
    game.value.boughtBuildings.map((b) => ({ name: b.name, power: getBoughtBuildingPower(b) })),
  );
  const buildingStatsTimers = ref<number[]>([]);

  const setBuildingStatsTimers = (
    boughtBuildings: BuildingWithStats[],
    buildingPowers: typeof boughtBuildingPowers.value,
  ) => {
    for (const boughtBuilding of boughtBuildings) {
      const buildingPower = buildingPowers.find((b) => b.name === boughtBuilding.name);
      if (!buildingPower) return;

      buildingStatsTimers.value.push(
        setInterval(
          () => {
            boughtBuilding.producedValue += buildingPower.power / FPS;
          },
          dayjs.duration(1, "second").milliseconds() / FPS,
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
