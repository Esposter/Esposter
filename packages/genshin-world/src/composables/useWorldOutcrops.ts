import type { AdventureRankTables } from "#src/models/adventureRank/AdventureRankTables";
import type { Enemy } from "#src/models/enemy/Enemy";
import type { EnemyCamp } from "#src/models/enemy/EnemyCamp";
import type { Inventory } from "#src/models/inventory/Inventory";
import type { Wallet } from "#src/models/inventory/Wallet";
import type { Outcrop } from "#src/models/leyLine/Outcrop";
import type { OutcropKind } from "#src/models/leyLine/OutcropKind";
import type { OutcropKindRule } from "#src/models/leyLine/OutcropKindRule";
import type { OutcropPlacement } from "#src/models/leyLine/OutcropPlacement";
import type { BlossomClaimOffer } from "#src/models/originalResin/BlossomClaimOffer";
import type { BlossomClaimPrompt } from "#src/models/originalResin/BlossomClaimPrompt";
import type { Ref } from "vue";

import { EnemyState } from "#src/models/enemy/EnemyState";
import { OutcropEvent } from "#src/models/leyLine/OutcropEvent";
import { OutcropStage } from "#src/models/leyLine/OutcropStage";
import { BlossomKind } from "#src/models/originalResin/BlossomKind";
import { checkIsGameDataKey } from "#src/services/data/checkIsGameDataKey";
import { gainCompanionshipExp } from "#src/services/friendship/gainCompanionshipExp";
import { advanceOutcrop } from "#src/services/leyLine/advanceOutcrop";
import { advanceOutcropFight } from "#src/services/leyLine/advanceOutcropFight";
import { computeDailyOutcrops } from "#src/services/leyLine/computeDailyOutcrops";
import { computeOutcropClaimRewards } from "#src/services/leyLine/computeOutcropClaimRewards";
import { computeOutcropInteractables } from "#src/services/leyLine/computeOutcropInteractables";
import { OUTCROP_TOUCH_RADIUS } from "#src/services/leyLine/constants";
import { createOutcropCamp } from "#src/services/leyLine/createOutcropCamp";
import { readOutcropRegion } from "#src/services/leyLine/readOutcropRegion";
import { RegionIdCityIdMap } from "#src/services/leyLine/RegionIdCityIdMap";
import { BlossomCompanionshipExpMap } from "#src/services/originalResin/BlossomCompanionshipExpMap";
import { claimResinReward } from "#src/services/originalResin/claimResinReward";
import { computeBlossomClaimPrompt } from "#src/services/originalResin/computeBlossomClaimPrompt";
import { refillOriginalResinWithFragileResin } from "#src/services/originalResin/refillOriginalResinWithFragileResin";
import { getDeployedCharacterIds } from "#src/services/party/getDeployedCharacterIds";
import { drawRewardItems } from "#src/services/reward/drawRewardItems";
import { checkIsDailyResetDayCurrent } from "#src/services/time/checkIsDailyResetDayCurrent";
import { useWorldAdventureRankStore } from "#src/store/adventureRank";
import { useWorldFriendshipStore } from "#src/store/friendship";
import { useWorldGroundStore } from "#src/store/ground";
import { useWorldPartyStore } from "#src/store/party";
import { useWorldSessionStore } from "#src/store/session";
import { useWorldStatuesStore } from "#src/store/statues";
import { getResultAsync, getSynchronizedFunction } from "@esposter/shared";
import { watchImmediate } from "@vueuse/core";
import { storeToRefs } from "pinia";
import { computed, shallowRef } from "vue";

// The ley line outcrops standing in the loaded regions: a daily reset draws each region's open kinds to its fitted places.
// A Character who stands within reach of a waiting outcrop touches it, which starts its fight and spawns its camp there,
// And the camp's last enemy falling reveals the blossom. Pressing F at a revealed blossom offers the claims the held
// Resin affords, and choosing one spends its resin, grants the kind's rewards for the World Level into the bag and the
// Wallet, gives the deployed team the claim's Companionship EXP, and moves the outcrop on within its region. A claim the
// Holdings or the bag cannot pay whole is refused, and the blossom stays
export const useWorldOutcrops = ({
  adventureRankTables,
  enemyMap,
  placesMap,
}: {
  adventureRankTables: AdventureRankTables;
  enemyMap: ReadonlyMap<string, Enemy>;
  placesMap: Readonly<Ref<ReadonlyMap<string, OutcropPlacement[]>>>;
}) => {
  const worldPartyStore = useWorldPartyStore();
  const { characters } = storeToRefs(worldPartyStore);
  const { party } = worldPartyStore;
  const worldFriendshipStore = useWorldFriendshipStore();
  const { friendshipLevels } = storeToRefs(worldFriendshipStore);
  const worldGroundStore = useWorldGroundStore();
  const { getGroundHeight } = worldGroundStore;
  const worldStatuesStore = useWorldStatuesStore();
  const { regionStatueProgressMap } = storeToRefs(worldStatuesStore);
  const worldAdventureRankStore = useWorldAdventureRankStore();
  const { adventureExp, completedMainQuestIds, rank } = storeToRefs(worldAdventureRankStore);
  const worldSessionStore = useWorldSessionStore();
  const { inventory, wallet } = storeToRefs(worldSessionStore);
  const { events, setInventory, setWallet } = worldSessionStore;
  const outcrops = shallowRef<Outcrop[]>([]);
  // Every loaded region's places in one list, and the region each place stands in, as the places' ids are the map's own
  const placements = computed(() => [...placesMap.value.values()].flat());
  const regionIdOfPlace = computed(
    () =>
      new Map(
        [...placesMap.value].flatMap(([regionId, places]) => places.map(({ id }): [number, string] => [id, regionId])),
      ),
  );
  // Each loaded region's kinds, read by the key its publish wrote once the region is entered, never at the world's first
  // Screen. A region no city is named for, or no publish wrote, opens no kind
  const kindRulesMap = shallowRef<ReadonlyMap<string, OutcropKindRule[]>>(new Map());
  const requestedRegionIds = new Set<string>();
  watchImmediate(placesMap, (places) => {
    for (const regionId of places.keys()) {
      const cityId = RegionIdCityIdMap[regionId];
      if (cityId === undefined || requestedRegionIds.has(regionId)) continue;
      requestedRegionIds.add(regionId);
      const regionKey: `leyLine/regions/${string}` = `leyLine/regions/${cityId}`;
      if (checkIsGameDataKey(regionKey))
        getSynchronizedFunction(() =>
          getResultAsync(() => readOutcropRegion(worldSessionStore.gameDataBaseUrl, regionKey)).match(
            ({ kinds }) => {
              kindRulesMap.value = new Map([...kindRulesMap.value, [regionId, kinds]]);
            },
            (error) => {
              console.error(error);
            },
          ),
        )();
    }
  });
  // The camp each touched outcrop spawned, by its place, which is in the world only while its outcrop is fighting
  const fightCamps = shallowRef<ReadonlyMap<number, EnemyCamp>>(new Map());
  const outcropCamps = computed(() =>
    outcrops.value.flatMap(({ placeId, stage }) => {
      const camp = fightCamps.value.get(placeId);
      return stage === OutcropStage.Fighting && camp ? [camp] : [];
    }),
  );
  const outcropInteractables = computed(() =>
    computeOutcropInteractables(outcrops.value, placements.value, worldSessionStore.gameText, getGroundHeight),
  );
  // The claims F offers at a cleared outcrop's blossom, and the place they are offered at, none where the held resin
  // Affords none and no Fragile Resin can restore it
  const claimPrompt = shallowRef<BlossomClaimPrompt & { placeId: number }>();
  // An event moves the one outcrop it names within its region, and the place the other kind of that region holds is kept
  // Out of its move
  const applyEvent = (placeId: number, event: OutcropEvent) => {
    const regionId = regionIdOfPlace.value.get(placeId);
    if (regionId === undefined) return;
    const regionPlaces = placesMap.value.get(regionId) ?? [];
    outcrops.value = outcrops.value.map((outcrop) =>
      outcrop.placeId === placeId
        ? advanceOutcrop(
            regionPlaces,
            outcrop,
            outcrops.value.find(
              ({ kind, placeId: otherPlaceId }) =>
                kind !== outcrop.kind && regionIdOfPlace.value.get(otherPlaceId) === regionId,
            )?.placeId,
            event,
          )
        : outcrop,
    );
  };
  // A region's day is drawn once its kinds and places are both loaded, and drawn again at the first daily reset after its
  // Draw. A draw starts that region's outcrops over, and drops the fights of the camps the last day spawned in it
  const drawnAtMap = new Map<string, Temporal.Instant>();
  const drawDayOutcrops = (now: Temporal.Instant, random: () => number) => {
    for (const [regionId, places] of placesMap.value) {
      const kindRules = kindRulesMap.value.get(regionId);
      if (!kindRules || kindRules.length === 0 || places.length === 0) continue;
      const drawnAt = drawnAtMap.get(regionId);
      if (drawnAt !== undefined && checkIsDailyResetDayCurrent(drawnAt, now)) continue;
      const unlockedCityIds = [...regionStatueProgressMap.value.keys()].flatMap(
        (unlockedRegionId) => RegionIdCityIdMap[unlockedRegionId] ?? [],
      );
      const isOutsideRegion = (placeId: number) => regionIdOfPlace.value.get(placeId) !== regionId;
      outcrops.value = [
        ...outcrops.value.filter(({ placeId }) => isOutsideRegion(placeId)),
        ...computeDailyOutcrops(kindRules, places, rank.value, unlockedCityIds, random),
      ];
      fightCamps.value = new Map([...fightCamps.value].filter(([placeId]) => isOutsideRegion(placeId)));
      drawnAtMap.set(regionId, now);
    }
  };
  // A touch starts the fight of each waiting outcrop within reach of the point, and spawns its camp at its place
  const touchOutcropsNear = (x: number, z: number, random: () => number) => {
    for (const { placeId, stage } of outcrops.value) {
      if (stage !== OutcropStage.Waiting) continue;
      const place = placements.value.find(({ id }) => id === placeId);
      const regionId = regionIdOfPlace.value.get(placeId);
      if (
        !place ||
        regionId === undefined ||
        Math.hypot(place.position.x - x, place.position.z - z) > OUTCROP_TOUCH_RADIUS
      )
        continue;
      fightCamps.value = new Map([...fightCamps.value, [placeId, createOutcropCamp(regionId, place, random)]]);
      applyEvent(placeId, OutcropEvent.Touched);
    }
  };
  // A defeated enemy counts as down whether or not the enemies still hold it, so the last of a camp reveals its blossom
  events.on("defeatEnemy", (enemy) => {
    const enemies = [
      { campId: enemy.campId, state: EnemyState.Dead },
      ...[...enemyMap.values()].filter(({ campId, id }) => campId !== enemy.campId || id !== enemy.id),
    ];
    outcrops.value = outcrops.value.map((outcrop) => advanceOutcropFight(placements.value, outcrop, enemies));
  });
  const findClearedOutcrop = (placeId: number) =>
    outcrops.value.find((outcrop) => outcrop.placeId === placeId && outcrop.stage === OutcropStage.Cleared);
  // The rule of an outcrop's kind, from the kinds of the region its place stands in
  const findKindRule = (placeId: number, kind: OutcropKind) => {
    const regionId = regionIdOfPlace.value.get(placeId);
    return regionId === undefined ? undefined : kindRulesMap.value.get(regionId)?.find((rule) => rule.kind === kind);
  };
  // Pressing F at a cleared outcrop's blossom offers the claims the held resin affords, and offers none where it affords
  // None
  const showOutcropClaim = (placeId: number, held: Wallet, bag: Inventory, now: Temporal.Instant) => {
    const prompt = computeBlossomClaimPrompt(BlossomKind.LeyLine, 0, held, bag, now);
    claimPrompt.value = prompt.offers.length > 0 || prompt.canRestore ? { ...prompt, placeId } : undefined;
  };
  const openOutcropClaim = (placeId: number, now: Temporal.Instant) => {
    if (!findClearedOutcrop(placeId)) return;
    showOutcropClaim(placeId, wallet.value, inventory.value, now);
  };
  const closeOutcropClaim = () => {
    claimPrompt.value = undefined;
  };
  // Restoring spends one Fragile Resin for the Original Resin it restores, and offers the claims again from the holdings
  // It leaves, as the prompt's restore row does
  const restoreOutcropClaim = (now: Temporal.Instant) => {
    const prompt = claimPrompt.value;
    if (!prompt?.canRestore) return;
    const restored = refillOriginalResinWithFragileResin(inventory.value, wallet.value, now);
    if (!restored) return;
    setWallet(restored.wallet);
    setInventory(restored.inventory);
    showOutcropClaim(prompt.placeId, restored.wallet, restored.inventory, now);
  };
  // Choosing a claim spends its resin, grants the rewards each of its claims draws, and moves the outcrop on. The claim
  // Is refused where the resin or the bag cannot pay it whole
  const chooseOutcropClaim = (
    offer: BlossomClaimOffer,
    now: Temporal.Instant,
    worldLevel: number,
    random: () => number,
  ) => {
    const prompt = claimPrompt.value;
    const outcrop = prompt && findClearedOutcrop(prompt.placeId);
    const kindRule = prompt && outcrop && findKindRule(prompt.placeId, outcrop.kind);
    if (!prompt || !kindRule || !friendshipLevels.value) return;
    claimPrompt.value = undefined;
    const rewards = Array.from({ length: offer.claimCount }, () =>
      drawRewardItems(computeOutcropClaimRewards(kindRule, worldLevel), random),
    ).flat();
    const claim = claimResinReward(
      adventureRankTables,
      wallet.value,
      inventory.value,
      offer,
      rewards,
      adventureExp.value,
      completedMainQuestIds.value,
      now,
      worldSessionStore.nameText,
      worldSessionStore.materialDataMap,
    );
    if (!claim) return;
    setWallet(claim.wallet);
    setInventory(claim.inventory);
    adventureExp.value = claim.adventureExp;
    // A claim gives its Companionship EXP once for each claim it holds, to the deployed team
    characters.value = gainCompanionshipExp(
      characters.value,
      getDeployedCharacterIds(party),
      BlossomCompanionshipExpMap[BlossomKind.LeyLine] * offer.claimCount,
      friendshipLevels.value,
    );
    fightCamps.value = new Map([...fightCamps.value].filter(([id]) => id !== prompt.placeId));
    applyEvent(prompt.placeId, OutcropEvent.Claimed);
  };
  return {
    chooseOutcropClaim,
    claimPrompt,
    closeOutcropClaim,
    drawDayOutcrops,
    kindRulesMap,
    openOutcropClaim,
    outcropCamps,
    outcropInteractables,
    outcrops,
    restoreOutcropClaim,
    touchOutcropsNear,
  };
};
