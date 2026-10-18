import type { Fish } from "#src/models/fishing/Fish";
import type { FishBait } from "#src/models/fishing/FishBait";
import type { FishingCast } from "#src/models/fishing/FishingCast";
import type { FishingPointPlace } from "#src/models/fishing/FishingPointPlace";
import type { FishingPool } from "#src/models/fishing/FishingPool";
import type { FishProficient } from "#src/models/fishing/FishProficient";
import type { FishReward } from "#src/models/fishing/FishReward";
import type { FishRod } from "#src/models/fishing/FishRod";
import type { Inventory } from "#src/models/inventory/Inventory";
import type { MaterialData } from "#src/models/inventory/MaterialData";
import type { Quest } from "#src/models/quest/Quest";
import type { QuestProgress } from "#src/models/quest/QuestProgress";
import type { Ref } from "vue";

import { FishingPhase } from "#src/models/fishing/FishingPhase";
import { addFishingCatch } from "#src/services/fishing/addFishingCatch";
import { checkIsFishingOpen } from "#src/services/fishing/checkIsFishingOpen";
import { computeFishingZone } from "#src/services/fishing/computeFishingZone";
import { SERENITEA_POT_ITEM_ID, SERENITEA_POT_QUEST_ID } from "#src/services/fishing/constants";
import { drawFishingPointFish } from "#src/services/fishing/drawFishingPointFish";
import { drawFishingRange } from "#src/services/fishing/drawFishingRange";
import { drawFishingZoneTravel } from "#src/services/fishing/drawFishingZoneTravel";
import { pickFishingBait } from "#src/services/fishing/pickFishingBait";
import { readFish } from "#src/services/fishing/readFish";
import { readFishBaits } from "#src/services/fishing/readFishBaits";
import { readFishingPoints } from "#src/services/fishing/readFishingPoints";
import { readFishingPools } from "#src/services/fishing/readFishingPools";
import { readFishProficiencies } from "#src/services/fishing/readFishProficiencies";
import { readFishRewards } from "#src/services/fishing/readFishRewards";
import { readFishRods } from "#src/services/fishing/readFishRods";
import { startFishingCast } from "#src/services/fishing/startFishingCast";
import { stepFishingCast } from "#src/services/fishing/stepFishingCast";
import { checkIsQuestFinished } from "#src/services/quest/checkIsQuestFinished";
import { GAME_TIME_ZONE } from "#src/services/time/constants";
import { getResultAsync } from "@esposter/shared";
import { computed, shallowRef } from "vue";

// The fishing of the world: the points in reach and whether fishing is open at them, the one cast held while a point is
// Fished, and the catch it puts in the bag. The game's tables are read once as the world starts
export const useWorldFishing = ({
  gameDataBaseUrl,
  getRegionIds,
  getWorldNow,
  inventory,
  materialDataMap,
  names,
  questProgressMap,
  quests,
  random,
  setInventory,
}: {
  gameDataBaseUrl: string;
  getRegionIds: () => string[];
  getWorldNow: () => Temporal.Instant;
  inventory: Ref<Inventory>;
  materialDataMap: ReadonlyMap<number, MaterialData>;
  names: Readonly<Record<string, string>>;
  questProgressMap: Ref<ReadonlyMap<string, QuestProgress>>;
  quests: Ref<Quest[]>;
  random: () => number;
  setInventory: (nextInventory: Inventory) => void;
}) => {
  const fishingPoints = shallowRef<Readonly<Record<string, FishingPointPlace[]>>>({});
  const pools = shallowRef<Readonly<Record<string, FishingPool[]>>>({});
  const fishMap = shallowRef<ReadonlyMap<number, Fish>>(new Map());
  const baits = shallowRef<FishBait[]>([]);
  const rods = shallowRef<FishRod[]>([]);
  const proficiencyMap = shallowRef<ReadonlyMap<number, FishProficient>>(new Map());
  const rewardMap = shallowRef<ReadonlyMap<number, FishReward>>(new Map());
  // oxlint-disable-next-line typescript/no-floating-promises -- match() handles both branches, so the promise it returns cannot reject and nothing waits on it
  getResultAsync(() =>
    Promise.all([
      readFishingPoints(gameDataBaseUrl),
      readFishingPools(gameDataBaseUrl),
      readFish(gameDataBaseUrl),
      readFishBaits(gameDataBaseUrl),
      readFishRods(gameDataBaseUrl),
      readFishProficiencies(gameDataBaseUrl),
      readFishRewards(gameDataBaseUrl),
    ]),
  ).match(
    ([points, regionPools, fishes, fishBaits, fishRods, proficiencies, rewards]) => {
      fishingPoints.value = points;
      pools.value = regionPools;
      fishMap.value = new Map(fishes.map((fish) => [fish.id, fish]));
      baits.value = fishBaits;
      rods.value = fishRods;
      proficiencyMap.value = new Map(proficiencies.map((proficiency) => [proficiency.id, proficiency]));
      rewardMap.value = new Map(rewards.map((reward) => [reward.rewardId, reward]));
    },
    (error) => {
      console.error(error);
    },
  );
  // The Serenitea Pot is held in the bag, and the quest that unlocks fishing is finished once it is carried. A quest not
  // Carried leaves the gate to the Pot alone
  const isFishingOpen = computed(() => {
    const quest = quests.value.find(({ id }) => id === SERENITEA_POT_QUEST_ID);
    return checkIsFishingOpen({
      isSereniteaPotOwned: inventory.value.items.some(({ definition }) => definition.id === SERENITEA_POT_ITEM_ID),
      isSereniteaPotQuestFinished:
        quest === undefined ? undefined : checkIsQuestFinished(quest, questProgressMap.value.get(quest.id)),
    });
  });
  const fishingPointPlaces = computed(() => getRegionIds().flatMap((region) => fishingPoints.value[region] ?? []));
  // The region each fishing point lies in, by the point's id, which its pools are drawn from
  const fishingPointRegionMap = computed(
    () =>
      new Map(
        getRegionIds().flatMap((region) => (fishingPoints.value[region] ?? []).map(({ id }) => [id, region] as const)),
      ),
  );
  // The bag's entries that are records of the table, in the bag's order
  const heldRecords = <T extends { id: number }>(records: readonly T[]): T[] =>
    inventory.value.items.flatMap(({ definition }) => records.filter(({ id }) => id === definition.id));
  const heldBaits = computed(() => heldRecords(baits.value));
  const heldRod = computed(() => heldRecords(rods.value)[0]);
  const pointId = shallowRef("");
  const cast = shallowRef<FishingCast>();
  const fishingRegion = computed(() =>
    pointId.value === "" ? undefined : fishingPointRegionMap.value.get(pointId.value),
  );
  const startCast = (region: string): FishingCast | undefined => {
    const hour = getWorldNow().toZonedDateTimeISO(GAME_TIME_ZONE).hour;
    const bait = pickFishingBait(heldBaits.value, pools.value, region, hour);
    if (bait === undefined) return undefined;
    const fishId = drawFishingPointFish(pools.value, region, hour, random(), new Set(bait.fishIds));
    const fish = fishId === undefined ? undefined : fishMap.value.get(fishId);
    const rod = heldRod.value;
    // The reel takes the proficiency's first gear, as no table says which gear a player holds
    const gear = fish === undefined ? undefined : proficiencyMap.value.get(fish.proficientId)?.gear[0];
    if (fish === undefined || rod === undefined || gear === undefined) return undefined;
    return startFishingCast({
      fish,
      gear,
      nibbleSeconds: drawFishingRange(fish.feelerTimes, random),
      rod,
      travel: drawFishingZoneTravel(fish, rod, random),
    });
  };
  // The cast steps while the fishing screen is open: a press at aim casts, and a press while the cast is out strikes it
  // And a hold reels it. A caught fish goes into the bag, and a cast that is scared off, or lost, returns to aiming
  const stepFishing = ({
    isReeling,
    isStruck,
    seconds,
  }: {
    isReeling: boolean;
    isStruck: boolean;
    seconds: number;
  }) => {
    const region = fishingRegion.value;
    if (region === undefined || !isFishingOpen.value) return;
    if (cast.value === undefined) {
      if (isStruck) cast.value = startCast(region);
      return;
    }
    const next = stepFishingCast(cast.value, { isReeling, isStruck, seconds });
    if (next.phase === FishingPhase.Caught) {
      setInventory(addFishingCatch(inventory.value, next.fish, rewardMap.value, names, materialDataMap).inventory);
      cast.value = undefined;
    } else cast.value = next.phase === FishingPhase.Aiming || next.phase === FishingPhase.Lost ? undefined : next;
  };
  // The cast as the fishing view shows it: its phase, the tension on the bar and the zone it is held in
  const castView = computed(() =>
    cast.value === undefined
      ? undefined
      : {
          phase: cast.value.phase,
          tension: cast.value.reel.tension,
          zone: computeFishingZone(cast.value.travel, cast.value.reelSeconds),
        },
  );
  const isFishingPoint = (id: string) => fishingPointRegionMap.value.has(id);
  const openFishingPoint = (id: string) => {
    pointId.value = id;
  };
  const closeFishing = () => {
    pointId.value = "";
    cast.value = undefined;
  };

  return { castView, closeFishing, fishingPointPlaces, isFishingOpen, isFishingPoint, openFishingPoint, stepFishing };
};
