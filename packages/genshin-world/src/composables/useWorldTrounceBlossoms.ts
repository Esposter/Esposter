import type { AdventureRankTables } from "#src/models/adventureRank/AdventureRankTables";
import type { TrounceBlossom } from "#src/models/bosses/TrounceBlossom";
import type { Character } from "#src/models/character/Character";
import type { Enemy } from "#src/models/enemy/Enemy";
import type { EnemyKind } from "#src/models/enemy/EnemyKind";
import type { EnemyKindId } from "#src/models/enemy/EnemyKindId";
import type { FriendshipLevel } from "#src/models/friendship/FriendshipLevel";
import type { Inventory } from "#src/models/inventory/Inventory";
import type { MaterialData } from "#src/models/inventory/MaterialData";
import type { Wallet } from "#src/models/inventory/Wallet";
import type { BlossomClaimOffer } from "#src/models/originalResin/BlossomClaimOffer";
import type { Party } from "#src/models/party/Party";
import type { WorldEvents } from "#src/models/world/WorldEvents";
import type { Ref } from "vue";

import { BlossomKind } from "#src/models/originalResin/BlossomKind";
import { checkIsTrounceBlossomClaimable } from "#src/services/bosses/checkIsTrounceBlossomClaimable";
import { claimTrounceBlossom } from "#src/services/bosses/claimTrounceBlossom";
import { computeDefeatTrounceBlossom } from "#src/services/bosses/computeDefeatTrounceBlossom";
import { computeTrounceBlossomInteractables } from "#src/services/bosses/computeTrounceBlossomInteractables";
import { NORMAL_BOSS_ADVENTURE_EXP, NORMAL_BOSS_COMPANIONSHIP_EXP } from "#src/services/bosses/constants";
import { checkIsGameDataKey } from "#src/services/data/checkIsGameDataKey";
import { EnemyKindTraitsMap } from "#src/services/enemy/EnemyKindTraitsMap";
import { getEnemyKind } from "#src/services/enemy/getEnemyKind";
import { getSpawnKey } from "#src/services/enemy/getSpawnKey";
import { gainCompanionshipExp } from "#src/services/friendship/gainCompanionshipExp";
import { readFriendshipLevels } from "#src/services/friendship/readFriendshipLevels";
import { computeBlossomClaimPrompt } from "#src/services/originalResin/computeBlossomClaimPrompt";
import { getDeployedCharacterIds } from "#src/services/party/getDeployedCharacterIds";
import { getResultAsync, takeOne } from "@esposter/shared";
import { computed, shallowRef } from "vue";

// The Trounce Blossoms the defeated normal bosses leave where they fell, keyed by the spawn each boss fell under. A
// Blossom waits until it is claimed or the boss respawns after a teleport, and a claim spends the boss's Original Resin
// And grants its World Level's rewards and its own drop, the claim setting the boss's respawn five seconds on. Choosing
// A claim the holdings or the bag cannot pay whole is refused, and the blossom stays as it was
export const useWorldTrounceBlossoms = ({
  adventureExp,
  adventureRankTables,
  characters,
  completedMainQuestIds,
  enemyKindMap,
  events,
  gainWorldAdventureExp,
  gameDataBaseUrl,
  gameText,
  getGroundHeight,
  inventory,
  materialDataMap,
  nameText,
  party,
  setInventory,
  setWallet,
  wallet,
}: {
  adventureExp: Ref<number>;
  adventureRankTables: AdventureRankTables;
  characters: Ref<Character[]>;
  completedMainQuestIds: Readonly<Ref<ReadonlySet<string>>>;
  enemyKindMap: ReadonlyMap<EnemyKindId, EnemyKind>;
  events: WorldEvents;
  gainWorldAdventureExp: (amount: number) => void;
  gameDataBaseUrl: string;
  gameText: Readonly<Record<string, string>>;
  getGroundHeight: (x: number, z: number) => number;
  inventory: Ref<Inventory>;
  materialDataMap: ReadonlyMap<number, MaterialData>;
  nameText: Readonly<Record<string, string>>;
  party: Party;
  setInventory: (nextInventory: Inventory) => void;
  setWallet: (nextWallet: Wallet) => void;
  wallet: Ref<Wallet>;
}) => {
  const trounceBlossoms = shallowRef<ReadonlyMap<string, TrounceBlossom>>(new Map());
  // The last teleport, which brings back a boss whose blossom is unclaimed, none until the player has teleported
  const lastTeleportAt = shallowRef<Temporal.ZonedDateTime>();
  const claimPrompt = shallowRef<{ offers: BlossomClaimOffer[]; spawnKey: string }>();
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
  const trounceBlossomInteractables = computed(() =>
    computeTrounceBlossomInteractables(trounceBlossoms.value, gameText, getGroundHeight, Temporal.Now.instant()),
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
    if (
      !trounceBlossom ||
      trounceBlossom.kind !== BlossomKind.NormalBoss ||
      !checkIsTrounceBlossomClaimable(trounceBlossom, now)
    )
      return;
    const { offers } = computeBlossomClaimPrompt(BlossomKind.NormalBoss, 0, wallet.value, inventory.value, now);
    claimPrompt.value = offers.length > 0 ? { offers, spawnKey } : undefined;
  };
  const closeTrounceBlossomClaim = () => {
    claimPrompt.value = undefined;
  };
  const chooseTrounceBlossomClaim = (now: Temporal.Instant, worldLevel: number, random: () => number) => {
    const prompt = claimPrompt.value;
    const trounceBlossom = prompt && trounceBlossoms.value.get(prompt.spawnKey);
    if (
      !prompt ||
      !trounceBlossom ||
      trounceBlossom.kind !== BlossomKind.NormalBoss ||
      !checkIsTrounceBlossomClaimable(trounceBlossom, now) ||
      friendshipLevels.value.length === 0
    )
      return;
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
    // A boss pays its Adventure EXP through the rank and its Companionship EXP to the deployed team, as the game does
    gainWorldAdventureExp(NORMAL_BOSS_ADVENTURE_EXP);
    characters.value = gainCompanionshipExp(
      characters.value,
      getDeployedCharacterIds(party),
      takeOne(NORMAL_BOSS_COMPANIONSHIP_EXP, worldLevel),
      friendshipLevels.value,
    );
    writeTrounceBlossom(prompt.spawnKey, { ...trounceBlossom, claimedAts: [...trounceBlossom.claimedAts, now] });
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
