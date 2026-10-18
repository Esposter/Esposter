import type { AdventureRankTables } from "#src/models/adventureRank/AdventureRankTables";
import type { TrounceBlossom } from "#src/models/bosses/TrounceBlossom";
import type { Enemy } from "#src/models/enemy/Enemy";
import type { EnemyKindId } from "#src/models/enemy/EnemyKindId";
import type { EnemyKind } from "#src/models/enemy/EnemyKind";
import type { Inventory } from "#src/models/inventory/Inventory";
import type { MaterialData } from "#src/models/inventory/MaterialData";
import type { Wallet } from "#src/models/inventory/Wallet";
import type { BlossomClaimOffer } from "#src/models/originalResin/BlossomClaimOffer";
import type { WorldEvents } from "#src/models/world/WorldEvents";
import type { Ref } from "vue";

import { BlossomKind } from "#src/models/originalResin/BlossomKind";
import { claimTrounceBlossom } from "#src/services/bosses/claimTrounceBlossom";
import { computeDefeatTrounceBlossom } from "#src/services/bosses/computeDefeatTrounceBlossom";
import { computeTrounceBlossomInteractables } from "#src/services/bosses/computeTrounceBlossomInteractables";
import { EnemyKindTraitsMap } from "#src/services/enemy/EnemyKindTraitsMap";
import { getEnemyKind } from "#src/services/enemy/getEnemyKind";
import { getSpawnKey } from "#src/services/enemy/getSpawnKey";
import { computeBlossomClaimPrompt } from "#src/services/originalResin/computeBlossomClaimPrompt";
import { computed, shallowRef } from "vue";

// The Trounce Blossoms the defeated normal bosses leave where they fell, keyed by the spawn each boss fell under. A
// Blossom waits until it is claimed or the boss respawns after a teleport, and a claim spends the boss's Original Resin
// And grants its World Level's rewards and its own drop, the claim setting the boss's respawn five seconds on. Choosing
// A claim the holdings or the bag cannot pay whole is refused, and the blossom stays as it was
export const useWorldTrounceBlossoms = ({
  adventureExp,
  adventureRankTables,
  completedMainQuestIds,
  enemyKindMap,
  events,
  gameText,
  getGroundHeight,
  inventory,
  materialDataMap,
  nameText,
  setInventory,
  setWallet,
  wallet,
}: {
  adventureExp: Ref<number>;
  adventureRankTables: AdventureRankTables;
  completedMainQuestIds: Readonly<Ref<ReadonlySet<string>>>;
  enemyKindMap: ReadonlyMap<EnemyKindId, EnemyKind>;
  events: WorldEvents;
  gameText: Readonly<Record<string, string>>;
  getGroundHeight: (x: number, z: number) => number;
  inventory: Ref<Inventory>;
  materialDataMap: ReadonlyMap<number, MaterialData>;
  nameText: Readonly<Record<string, string>>;
  setInventory: (nextInventory: Inventory) => void;
  setWallet: (nextWallet: Wallet) => void;
  wallet: Ref<Wallet>;
}) => {
  const trounceBlossoms = shallowRef<ReadonlyMap<string, TrounceBlossom>>(new Map());
  // The last teleport, which brings back a boss whose blossom is unclaimed, none until the player has teleported
  const lastTeleportAt = shallowRef<Temporal.ZonedDateTime>();
  const claimPrompt = shallowRef<{ offers: BlossomClaimOffer[]; spawnKey: string }>();
  const trounceBlossomInteractables = computed(() =>
    computeTrounceBlossomInteractables(trounceBlossoms.value, gameText, getGroundHeight),
  );
  const writeTrounceBlossom = (spawnKey: string, trounceBlossom: TrounceBlossom) => {
    trounceBlossoms.value = new Map(trounceBlossoms.value).set(spawnKey, trounceBlossom);
  };
  events.on("defeatEnemy", (enemy: Enemy) => {
    const { enemyType } = getEnemyKind(enemyKindMap, enemy.enemyKindId);
    const trounceBlossom = computeDefeatTrounceBlossom(
      enemyType,
      enemy.position,
      EnemyKindTraitsMap[enemy.enemyKindId].uniqueDropId,
    );
    if (trounceBlossom) writeTrounceBlossom(getSpawnKey(enemy.campId, enemy.id), trounceBlossom);
  });
  events.on("teleport", () => {
    lastTeleportAt.value = Temporal.Now.zonedDateTimeISO();
  });
  // The blossom of a respawned boss is gone, since it was either claimed or left behind by a teleport
  const forgetTrounceBlossom = (spawnKey: string) => {
    if (!trounceBlossoms.value.has(spawnKey)) return;
    const nextTrounceBlossoms = new Map(trounceBlossoms.value);
    nextTrounceBlossoms.delete(spawnKey);
    trounceBlossoms.value = nextTrounceBlossoms;
  };
  const openTrounceBlossomClaim = (spawnKey: string, now: Temporal.Instant) => {
    const trounceBlossom = trounceBlossoms.value.get(spawnKey);
    if (!trounceBlossom || trounceBlossom.claimedAt) return;
    const { offers } = computeBlossomClaimPrompt(BlossomKind.NormalBoss, 0, wallet.value, inventory.value, now);
    claimPrompt.value = offers.length > 0 ? { offers, spawnKey } : undefined;
  };
  const closeTrounceBlossomClaim = () => {
    claimPrompt.value = undefined;
  };
  const chooseTrounceBlossomClaim = (now: Temporal.Instant, worldLevel: number, random: () => number) => {
    const prompt = claimPrompt.value;
    const trounceBlossom = prompt && trounceBlossoms.value.get(prompt.spawnKey);
    if (!prompt || !trounceBlossom || trounceBlossom.claimedAt) return;
    claimPrompt.value = undefined;
    const claim = claimTrounceBlossom(
      adventureRankTables,
      wallet.value,
      inventory.value,
      worldLevel,
      trounceBlossom.uniqueDropId,
      adventureExp.value,
      completedMainQuestIds.value,
      now,
      nameText,
      materialDataMap,
      random,
    );
    if (!claim) return;
    setWallet(claim.wallet);
    setInventory(claim.inventory);
    adventureExp.value = claim.adventureExp;
    writeTrounceBlossom(prompt.spawnKey, { ...trounceBlossom, claimedAt: Temporal.Now.zonedDateTimeISO() });
  };
  return {
    chooseTrounceBlossomClaim,
    claimPrompt,
    closeTrounceBlossomClaim,
    forgetTrounceBlossom,
    lastTeleportAt,
    openTrounceBlossomClaim,
    trounceBlossomInteractables,
    trounceBlossoms,
  };
};
