import type { Enemy } from "#src/models/enemy/Enemy";
import type { EnemyCamp } from "#src/models/enemy/EnemyCamp";
import type { Inventory } from "#src/models/inventory/Inventory";
import type { MaterialData } from "#src/models/inventory/MaterialData";
import type { Wallet } from "#src/models/inventory/Wallet";
import type { Outcrop } from "#src/models/leyLine/Outcrop";
import type { OutcropKindRule } from "#src/models/leyLine/OutcropKindRule";
import type { OutcropPlacement } from "#src/models/leyLine/OutcropPlacement";
import type { WorldEvents } from "#src/models/world/WorldEvents";
import type { Ref } from "vue";

import { EnemyState } from "#src/models/enemy/EnemyState";
import { OutcropEvent } from "#src/models/leyLine/OutcropEvent";
import { OutcropStage } from "#src/models/leyLine/OutcropStage";
import { OUTCROP_TOUCH_RADIUS } from "#src/services/leyLine/constants";
import { advanceOutcrop } from "#src/services/leyLine/advanceOutcrop";
import { advanceOutcropFight } from "#src/services/leyLine/advanceOutcropFight";
import { computeDailyOutcrops } from "#src/services/leyLine/computeDailyOutcrops";
import { computeOutcropClaimRewards } from "#src/services/leyLine/computeOutcropClaimRewards";
import { computeOutcropInteractables } from "#src/services/leyLine/computeOutcropInteractables";
import { createOutcropCamp } from "#src/services/leyLine/createOutcropCamp";
import { drawRewardItems } from "#src/services/reward/drawRewardItems";
import { grantRewardItems } from "#src/services/reward/grantRewardItems";
import { computed, shallowRef } from "vue";

// The ley line outcrops standing in the region: a daily reset draws each open kind's blossom to a fitted place. A
// Character who stands within reach of a waiting outcrop touches it, which starts its fight and spawns its camp there,
// And the camp's last enemy falling reveals the blossom to claim. A claim pays the kind's rewards for the World Level
// Into the wallet and the bag, and moves the outcrop on. A claim the bag cannot take whole is refused, and the blossom
// Stays in place
export const useWorldOutcrops = ({
  areaId,
  enemyMap,
  events,
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
  areaId: Readonly<Ref<string>>;
  enemyMap: ReadonlyMap<string, Enemy>;
  events: WorldEvents;
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
  // A claim pays the blossom's rewards for the World Level, where the bag can take them whole, and moves the outcrop on
  const claimOutcropById = (placeId: number, worldLevel: number, random: () => number) => {
    const outcrop = outcrops.value.find((item) => item.placeId === placeId && item.stage === OutcropStage.Cleared);
    const kindRule = kindRules.value.find(({ kind }) => kind === outcrop?.kind);
    if (!kindRule) return;
    const granted = grantRewardItems(
      wallet.value,
      inventory.value,
      drawRewardItems(computeOutcropClaimRewards(kindRule, worldLevel), random),
      nameText,
      materialDataMap,
    );
    if (!granted) return;
    setWallet(granted.wallet);
    setInventory(granted.inventory);
    fightCamps.value = new Map([...fightCamps.value].filter(([id]) => id !== placeId));
    applyEvent(placeId, OutcropEvent.Claimed);
  };
  return { claimOutcropById, outcropCamps, outcropInteractables, outcrops, resetOutcrops, touchOutcropsNear };
};
