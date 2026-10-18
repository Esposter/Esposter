import type { AdventureRankTables } from "#src/models/adventureRank/AdventureRankTables";
import type { Character } from "#src/models/character/Character";
import type { Enemy } from "#src/models/enemy/Enemy";
import type { EnemyCamp } from "#src/models/enemy/EnemyCamp";
import type { FriendshipLevel } from "#src/models/friendship/FriendshipLevel";
import type { Inventory } from "#src/models/inventory/Inventory";
import type { MaterialData } from "#src/models/inventory/MaterialData";
import type { Wallet } from "#src/models/inventory/Wallet";
import type { Outcrop } from "#src/models/leyLine/Outcrop";
import type { OutcropKindRule } from "#src/models/leyLine/OutcropKindRule";
import type { OutcropPlacement } from "#src/models/leyLine/OutcropPlacement";
import type { OfferingProgressSave } from "#src/models/offering/OfferingProgressSave";
import type { BlossomClaimOffer } from "#src/models/originalResin/BlossomClaimOffer";
import type { BlossomClaimPrompt } from "#src/models/originalResin/BlossomClaimPrompt";
import type { Party } from "#src/models/party/Party";
import type { WorldEvents } from "#src/models/world/WorldEvents";
import type { Ref } from "vue";

import { EnemyState } from "#src/models/enemy/EnemyState";
import { OutcropEvent } from "#src/models/leyLine/OutcropEvent";
import { OutcropStage } from "#src/models/leyLine/OutcropStage";
import { BlossomKind } from "#src/models/originalResin/BlossomKind";
import { checkIsGameDataKey } from "#src/services/data/checkIsGameDataKey";
import { gainCompanionshipExp } from "#src/services/friendship/gainCompanionshipExp";
import { readFriendshipLevels } from "#src/services/friendship/readFriendshipLevels";
import { advanceOutcrop } from "#src/services/leyLine/advanceOutcrop";
import { advanceOutcropFight } from "#src/services/leyLine/advanceOutcropFight";
import { checkIsOutcropDayCurrent } from "#src/services/leyLine/checkIsOutcropDayCurrent";
import { computeDailyOutcrops } from "#src/services/leyLine/computeDailyOutcrops";
import { computeOutcropClaimRewards } from "#src/services/leyLine/computeOutcropClaimRewards";
import { computeOutcropInteractables } from "#src/services/leyLine/computeOutcropInteractables";
import { OUTCROP_REGION_ID, OUTCROP_TOUCH_RADIUS } from "#src/services/leyLine/constants";
import { createOutcropCamp } from "#src/services/leyLine/createOutcropCamp";
import { readOutcropRegion } from "#src/services/leyLine/readOutcropRegion";
import { RegionIdCityIdMap } from "#src/services/leyLine/RegionIdCityIdMap";
import { BlossomCompanionshipExpMap } from "#src/services/originalResin/BlossomCompanionshipExpMap";
import { claimResinReward } from "#src/services/originalResin/claimResinReward";
import { computeBlossomClaimPrompt } from "#src/services/originalResin/computeBlossomClaimPrompt";
import { refillOriginalResinWithFragileResin } from "#src/services/originalResin/refillOriginalResinWithFragileResin";
import { getDeployedCharacterIds } from "#src/services/party/getDeployedCharacterIds";
import { drawRewardItems } from "#src/services/reward/drawRewardItems";
import { getResultAsync } from "@esposter/shared";
import { computed, shallowRef } from "vue";

// The ley line outcrops standing in the region: a daily reset draws each open kind's blossom to a fitted place. A
// Character who stands within reach of a waiting outcrop touches it, which starts its fight and spawns its camp there,
// And the camp's last enemy falling reveals the blossom. Pressing F at a revealed blossom offers the claims the held
// Resin affords, and choosing one spends its resin, grants the kind's rewards for the World Level into the bag and the
// Wallet, gives the deployed team the claim's Companionship EXP, and moves the outcrop on. A claim the holdings or the bag
// Cannot pay whole is refused, and the blossom stays
export const useWorldOutcrops = ({
  adventureExp,
  adventureRankTables,
  areaId,
  characters,
  completedMainQuestIds,
  enemyMap,
  events,
  gameDataBaseUrl,
  gameText,
  getGroundHeight,
  inventory,
  materialDataMap,
  nameText,
  party,
  placements,
  rank,
  regionStatueProgressMap,
  setInventory,
  setWallet,
  wallet,
}: {
  adventureExp: Ref<number>;
  adventureRankTables: AdventureRankTables;
  areaId: Readonly<Ref<string>>;
  characters: Ref<Character[]>;
  completedMainQuestIds: Readonly<Ref<ReadonlySet<string>>>;
  enemyMap: ReadonlyMap<string, Enemy>;
  events: WorldEvents;
  gameDataBaseUrl: string;
  gameText: Readonly<Record<string, string>>;
  getGroundHeight: (x: number, z: number) => number;
  inventory: Ref<Inventory>;
  materialDataMap: ReadonlyMap<number, MaterialData>;
  nameText: Readonly<Record<string, string>>;
  party: Party;
  placements: Readonly<Ref<OutcropPlacement[]>>;
  rank: Readonly<Ref<number>>;
  regionStatueProgressMap: Readonly<Ref<ReadonlyMap<string, OfferingProgressSave>>>;
  setInventory: (nextInventory: Inventory) => void;
  setWallet: (nextWallet: Wallet) => void;
  wallet: Ref<Wallet>;
}) => {
  const outcrops = shallowRef<Outcrop[]>([]);
  // The region's kinds, read by the key its publish wrote. A region no publish wrote opens no kind
  const kindRules = shallowRef<OutcropKindRule[]>([]);
  const regionKey: `leyLine/regions/${string}` = `leyLine/regions/${RegionIdCityIdMap[OUTCROP_REGION_ID]}`;
  if (checkIsGameDataKey(regionKey))
    getResultAsync(() => readOutcropRegion(gameDataBaseUrl, regionKey)).match(
      ({ kinds }) => {
        kindRules.value = kinds;
      },
      (error) => {
        console.error(error);
      },
    );
  // The Friendship Levels a claim's Companionship EXP is kept under, read from the friendship record. A claim waits until
  // They are loaded, since the EXP has no top to stop at without them
  const friendshipLevels = shallowRef<FriendshipLevel[]>([]);
  if (checkIsGameDataKey("friendship/friendship"))
    getResultAsync(() => readFriendshipLevels(gameDataBaseUrl)).match(
      (levels) => {
        friendshipLevels.value = levels;
      },
      (error) => {
        console.error(error);
      },
    );
  // The camp each touched outcrop spawned, by its place, which is in the world only while its outcrop is fighting
  const fightCamps = shallowRef<ReadonlyMap<number, EnemyCamp>>(new Map());
  const outcropCamps = computed(() =>
    outcrops.value.flatMap(({ placeId, stage }) => {
      const camp = fightCamps.value.get(placeId);
      return stage === OutcropStage.Fighting && camp ? [camp] : [];
    }),
  );
  const outcropInteractables = computed(() =>
    computeOutcropInteractables(outcrops.value, placements.value, gameText, getGroundHeight),
  );
  // The claims F offers at a cleared outcrop's blossom, and the place they are offered at, none where the held resin
  // Affords none and no Fragile Resin can restore it
  const claimPrompt = shallowRef<BlossomClaimPrompt & { placeId: number }>();
  // An event moves the one outcrop it names, and the place the other kind holds is kept out of its move
  const applyEvent = (placeId: number, event: OutcropEvent) => {
    outcrops.value = outcrops.value.map((outcrop) =>
      outcrop.placeId === placeId
        ? advanceOutcrop(
            placements.value,
            outcrop,
            outcrops.value.find(({ kind }) => kind !== outcrop.kind)?.placeId,
            event,
          )
        : outcrop,
    );
  };
  // The day's outcrops are drawn once the region's kinds and places are both loaded, and drawn again at the first daily
  // Reset after the draw. A draw starts every outcrop over, and drops the fights of the camps the last day spawned
  let drawnAt: Temporal.Instant | undefined;
  const drawDayOutcrops = (now: Temporal.Instant, random: () => number) => {
    if (kindRules.value.length === 0 || placements.value.length === 0) return;
    if (drawnAt !== undefined && checkIsOutcropDayCurrent(drawnAt, now)) return;
    const unlockedCityIds = [...regionStatueProgressMap.value.keys()].flatMap(
      (regionId) => RegionIdCityIdMap[regionId] ?? [],
    );
    outcrops.value = computeDailyOutcrops(kindRules.value, placements.value, rank.value, unlockedCityIds, random);
    fightCamps.value = new Map();
    drawnAt = now;
  };
  // A touch starts the fight of each waiting outcrop within reach of the point, and spawns its camp at its place
  const touchOutcropsNear = (x: number, z: number, random: () => number) => {
    for (const { placeId, stage } of outcrops.value) {
      if (stage !== OutcropStage.Waiting) continue;
      const place = placements.value.find(({ id }) => id === placeId);
      if (!place || Math.hypot(place.position.x - x, place.position.z - z) > OUTCROP_TOUCH_RADIUS) continue;
      fightCamps.value = new Map([...fightCamps.value, [placeId, createOutcropCamp(areaId.value, place, random)]]);
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
    const kindRule = kindRules.value.find(({ kind }) => kind === outcrop?.kind);
    if (!prompt || !kindRule || friendshipLevels.value.length === 0) return;
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
      nameText,
      materialDataMap,
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
    friendshipLevels,
    kindRules,
    openOutcropClaim,
    outcropCamps,
    outcropInteractables,
    outcrops,
    restoreOutcropClaim,
    touchOutcropsNear,
  };
};
