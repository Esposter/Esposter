import type { AdventureRankTables } from "#src/models/adventureRank/AdventureRankTables";
import type { Enemy } from "#src/models/enemy/Enemy";
import type { EnemyCamp } from "#src/models/enemy/EnemyCamp";
import type { Inventory } from "#src/models/inventory/Inventory";
import type { MaterialData } from "#src/models/inventory/MaterialData";
import type { Wallet } from "#src/models/inventory/Wallet";
import type { Outcrop } from "#src/models/leyLine/Outcrop";
import type { OutcropKindRule } from "#src/models/leyLine/OutcropKindRule";
import type { OutcropPlacement } from "#src/models/leyLine/OutcropPlacement";
import type { BlossomClaimOffer } from "#src/models/originalResin/BlossomClaimOffer";
import type { WorldEvents } from "#src/models/world/WorldEvents";
import type { Ref } from "vue";

import { EnemyState } from "#src/models/enemy/EnemyState";
import { OutcropEvent } from "#src/models/leyLine/OutcropEvent";
import { OutcropStage } from "#src/models/leyLine/OutcropStage";
import { BlossomKind } from "#src/models/originalResin/BlossomKind";
import { ADVENTURE_EXP_ITEM_ID } from "#src/services/forging/constants";
import { advanceOutcrop } from "#src/services/leyLine/advanceOutcrop";
import { advanceOutcropFight } from "#src/services/leyLine/advanceOutcropFight";
import { computeDailyOutcrops } from "#src/services/leyLine/computeDailyOutcrops";
import { computeOutcropClaimRewards } from "#src/services/leyLine/computeOutcropClaimRewards";
import { computeOutcropInteractables } from "#src/services/leyLine/computeOutcropInteractables";
import { OUTCROP_TOUCH_RADIUS } from "#src/services/leyLine/constants";
import { createOutcropCamp } from "#src/services/leyLine/createOutcropCamp";
import { claimResinReward } from "#src/services/originalResin/claimResinReward";
import { computeBlossomClaimPrompt } from "#src/services/originalResin/computeBlossomClaimPrompt";
import { drawRewardItems } from "#src/services/reward/drawRewardItems";
import { computed, shallowRef } from "vue";

// The ley line outcrops standing in the region: a daily reset draws each open kind's blossom to a fitted place. A
// Character who stands within reach of a waiting outcrop touches it, which starts its fight and spawns its camp there,
// And the camp's last enemy falling reveals the blossom. Pressing F at a revealed blossom offers the claims the held
// Resin affords, and choosing one spends its resin, grants the kind's rewards for the World Level into the bag and the
// Wallet, and moves the outcrop on. A claim the holdings or the bag cannot pay whole is refused, and the blossom stays
export const useWorldOutcrops = ({
  adventureRankTables,
  areaId,
  completedMainQuestIds,
  enemyMap,
  events,
  gainWorldAdventureExp,
  gameText,
  getGroundHeight,
  inventory,
  kindRules,
  materialDataMap,
  nameText,
  placements,
  setInventory,
  setWallet,
  wallet,
}: {
  adventureRankTables: AdventureRankTables;
  areaId: Readonly<Ref<string>>;
  completedMainQuestIds: ReadonlySet<string>;
  enemyMap: ReadonlyMap<string, Enemy>;
  events: WorldEvents;
  gainWorldAdventureExp: (amount: number) => void;
  gameText: Readonly<Record<string, string>>;
  getGroundHeight: (x: number, z: number) => number;
  inventory: Ref<Inventory>;
  kindRules: Readonly<Ref<OutcropKindRule[]>>;
  materialDataMap: ReadonlyMap<number, MaterialData>;
  nameText: Readonly<Record<string, string>>;
  placements: Readonly<Ref<OutcropPlacement[]>>;
  setInventory: (nextInventory: Inventory) => void;
  setWallet: (nextWallet: Wallet) => void;
  wallet: Ref<Wallet>;
}) => {
  const outcrops = shallowRef<Outcrop[]>([]);
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
  // Affords none
  const claimPrompt = shallowRef<{ offers: BlossomClaimOffer[]; placeId: number } | undefined>(undefined);
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
  // The daily reset starts every outcrop over, and drops the fights of the camps the last day spawned
  const resetOutcrops = (adventureRank: number, unlockedCityIds: number[], random: () => number) => {
    outcrops.value = computeDailyOutcrops(kindRules.value, placements.value, adventureRank, unlockedCityIds, random);
    fightCamps.value = new Map();
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
  const openOutcropClaim = (placeId: number, now: Temporal.Instant) => {
    if (!findClearedOutcrop(placeId)) return;
    const { offers } = computeBlossomClaimPrompt(BlossomKind.LeyLine, 0, wallet.value, inventory.value, now);
    claimPrompt.value = offers.length > 0 ? { offers, placeId } : undefined;
  };
  const closeOutcropClaim = () => {
    claimPrompt.value = undefined;
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
    if (!prompt || !kindRule) return;
    claimPrompt.value = undefined;
    const rewards = Array.from({ length: offer.claimCount }, () =>
      drawRewardItems(computeOutcropClaimRewards(kindRule, worldLevel), random),
    ).flat();
    const adventureExp = rewards
      .filter(({ id }) => id === ADVENTURE_EXP_ITEM_ID)
      .reduce((sum, { count }) => sum + count, 0);
    const claim = claimResinReward(
      adventureRankTables,
      wallet.value,
      inventory.value,
      offer,
      rewards,
      adventureExp,
      completedMainQuestIds,
      now,
      nameText,
      materialDataMap,
    );
    if (!claim) return;
    setWallet(claim.wallet);
    setInventory(claim.inventory);
    gainWorldAdventureExp(claim.adventureExp);
    fightCamps.value = new Map([...fightCamps.value].filter(([id]) => id !== prompt.placeId));
    applyEvent(prompt.placeId, OutcropEvent.Claimed);
  };
  return {
    chooseOutcropClaim,
    claimPrompt,
    closeOutcropClaim,
    openOutcropClaim,
    outcropCamps,
    outcropInteractables,
    outcrops,
    resetOutcrops,
    touchOutcropsNear,
  };
};
