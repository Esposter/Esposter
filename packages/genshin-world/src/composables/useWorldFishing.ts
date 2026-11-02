import type { Fish } from "#src/models/fishing/Fish";
import type { FishBait } from "#src/models/fishing/FishBait";
import type { FishingCast } from "#src/models/fishing/FishingCast";
import type { FishingPointPlace } from "#src/models/fishing/FishingPointPlace";
import type { FishingPool } from "#src/models/fishing/FishingPool";
import type { FishProficient } from "#src/models/fishing/FishProficient";
import type { FishReward } from "#src/models/fishing/FishReward";
import type { FishRod } from "#src/models/fishing/FishRod";

import { FishingPhase } from "#src/models/fishing/FishingPhase";
import { addFishingCatch } from "#src/services/fishing/addFishingCatch";
import { checkIsFishingOpen } from "#src/services/fishing/checkIsFishingOpen";
import { computeFishingCatchAts } from "#src/services/fishing/computeFishingCatchAts";
import { computeFishingZone } from "#src/services/fishing/computeFishingZone";
import { computeStandingFishingStocks } from "#src/services/fishing/computeStandingFishingStocks";
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
import { computeGameHour } from "#src/services/time/computeGameHour";
import { useWorldQuestsStore } from "#src/store/quests";
import { useWorldSessionStore } from "#src/store/session";
import { getResultAsync, getSynchronizedFunction } from "@esposter/shared";
import { storeToRefs } from "pinia";
import { computed, shallowRef } from "vue";

// The fishing of the world: the points in reach and whether fishing is open at them, the one cast held while a point is
// Fished, and the catch it puts in the bag. Each stock's catches are held until they return, so a stock refills fish by
// Fish. The game's tables are read once as the world starts
export const useWorldFishing = ({
  getRegionIds,
  random,
  savedFishingCatchAts,
}: {
  getRegionIds: () => string[];
  random: () => number;
  savedFishingCatchAts: ReadonlyMap<string, readonly Temporal.Instant[]>;
}) => {
  const worldQuestsStore = useWorldQuestsStore();
  const { questProgressMap, quests } = storeToRefs(worldQuestsStore);
  const worldSessionStore = useWorldSessionStore();
  const { inventory, worldNow } = storeToRefs(worldSessionStore);
  const { getWorldNow, setInventory } = worldSessionStore;
  const fishingPoints = shallowRef<Readonly<Record<string, FishingPointPlace[]>>>({});
  const pools = shallowRef<Readonly<Record<string, FishingPool[]>>>({});
  const fishMap = shallowRef<ReadonlyMap<number, Fish>>(new Map());
  const baits = shallowRef<FishBait[]>([]);
  const rods = shallowRef<FishRod[]>([]);
  const proficiencyMap = shallowRef<ReadonlyMap<number, FishProficient>>(new Map());
  const rewardMap = shallowRef<ReadonlyMap<number, FishReward>>(new Map());
  // The catches each stock holds that are not yet back, by the stock's key
  const caughtAtMap = shallowRef<ReadonlyMap<string, readonly Temporal.Instant[]>>(savedFishingCatchAts);
  getSynchronizedFunction(() =>
    getResultAsync(() =>
      Promise.all([
        readFishingPoints(worldSessionStore.gameDataBaseUrl),
        readFishingPools(worldSessionStore.gameDataBaseUrl),
        readFish(worldSessionStore.gameDataBaseUrl),
        readFishBaits(worldSessionStore.gameDataBaseUrl),
        readFishRods(worldSessionStore.gameDataBaseUrl),
        readFishProficiencies(worldSessionStore.gameDataBaseUrl),
        readFishRewards(worldSessionStore.gameDataBaseUrl),
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
    ),
  )();
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
  // The stocks of a region's pools standing at the moment, the game hour taken from the moment itself
  const getStandingStocks = (region: string, now: Temporal.Instant) =>
    computeStandingFishingStocks(pools.value, region, computeGameHour(now), caughtAtMap.value, now);
  // A point draws from every pool of its region, so its points are in reach only while their region has a stock standing at
  // The hour, the ripple the wiki's Fishing page puts on the spot as the fish are caught
  const fishingPointPlaces = computed(() => {
    const now = worldNow.value;
    return getRegionIds()
      .filter((region) => getStandingStocks(region, now).length > 0)
      .flatMap((region) => fishingPoints.value[region] ?? []);
  });
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
    const now = getWorldNow();
    const standingStocks = getStandingStocks(region, now);
    const bait = pickFishingBait(heldBaits.value, standingStocks);
    if (bait === undefined) return undefined;
    const draw = drawFishingPointFish(standingStocks, random(), new Set(bait.fishIds));
    const fish = draw === undefined ? undefined : fishMap.value.get(draw.fishId);
    const rod = heldRod.value;
    // The reel takes the proficiency's first gear, as no table says which gear a player holds
    const gear = fish === undefined ? undefined : proficiencyMap.value.get(fish.proficientId)?.gear[0];
    if (draw === undefined || fish === undefined || rod === undefined || gear === undefined) return undefined;
    return startFishingCast({
      fish,
      gear,
      nibbleSeconds: drawFishingRange(fish.feelerTimes, random),
      rod,
      stockKey: draw.stockKey,
      travel: drawFishingZoneTravel(fish, rod, random),
    });
  };
  // The cast steps while the fishing screen is open: a press at aim casts, and a press while the cast is out strikes it
  // And a hold reels it. A caught fish goes into the bag and is held against its stock, and a cast that is scared off, or
  // Lost, returns to aiming
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
      setInventory(
        addFishingCatch(
          inventory.value,
          next.fish,
          rewardMap.value,
          worldSessionStore.nameText,
          worldSessionStore.materialDataMap,
        ).inventory,
      );
      caughtAtMap.value = computeFishingCatchAts(caughtAtMap.value, next.stockKey, getWorldNow());
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
  const checkIsFishingPoint = (id: string): boolean => fishingPointRegionMap.value.has(id);
  const openFishingPoint = (id: string) => {
    pointId.value = id;
  };
  const closeFishing = () => {
    pointId.value = "";
    cast.value = undefined;
  };

  return {
    castView,
    checkIsFishingPoint,
    closeFishing,
    fishingCatchAts: caughtAtMap,
    fishingPointPlaces,
    isFishingOpen,
    openFishingPoint,
    stepFishing,
  };
};
