import { BuildingWithStats, Target } from "@/models/clicker";
import { useBuildingStore } from "@/store/clicker/useBuildingStore";
import { useGameStore } from "@/store/clicker/useGameStore";
import { clearInterval, setInterval } from "worker-timers";

export const useBuildingStatsTimer = () => {
  const gameStore = useGameStore();
  const { game } = $(storeToRefs(gameStore));
  const buildingStore = useBuildingStore();
  const { getBoughtBuildingPower } = buildingStore;
  const boughtBuildingPowers = $computed<{ name: Target; power: number }[]>(() =>
    game.boughtBuildings.map((b) => ({ name: b.name, power: getBoughtBuildingPower(b) }))
  );
  let buildingStatsTimers = $ref<number[]>([]);

  const setBuildingStatsTimers = (
    boughtBuildings: BuildingWithStats[],
    buildingPowers: typeof boughtBuildingPowers
  ) => {
    for (const boughtBuilding of boughtBuildings) {
      const buildingPower = buildingPowers.find((b) => b.name === boughtBuilding.name);
      if (!buildingPower) return;

      buildingStatsTimers.push(
        setInterval(() => {
          boughtBuilding.producedValue += buildingPower.power / FPS;
        }, 1000 / FPS)
      );
    }
  };

  onMounted(() => {
    setBuildingStatsTimers(game.boughtBuildings, boughtBuildingPowers);
  });

  onUnmounted(() => {
    buildingStatsTimers.forEach((t) => clearInterval(t));
  });

  watchEffect(() => {
    buildingStatsTimers.forEach((t) => clearInterval(t));
    buildingStatsTimers = [];
    setBuildingStatsTimers(game.boughtBuildings, boughtBuildingPowers);
  });
};
