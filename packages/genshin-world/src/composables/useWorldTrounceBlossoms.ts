import type { TrounceBlossom } from "#src/models/bosses/TrounceBlossom";
import type { Character } from "#src/models/character/Character";
import type { Enemy } from "#src/models/enemy/Enemy";
import type { EnemyKind } from "#src/models/enemy/EnemyKind";
import type { FriendshipLevels } from "#src/models/friendship/FriendshipLevels";
import type { BlossomClaimOffer } from "#src/models/originalResin/BlossomClaimOffer";
import type { Party } from "#src/models/party/Party";
import type { GenshinSaveState } from "#src/models/save/GenshinSaveState";
import type { WorldBagDependencies } from "#src/models/world/WorldBagDependencies";
import type { WorldEvents } from "#src/models/world/WorldEvents";
import type { Ref } from "vue";

import { BlossomKind } from "#src/models/originalResin/BlossomKind";
import { checkIsTrounceBlossomClaimable } from "#src/services/bosses/checkIsTrounceBlossomClaimable";
import { claimTrounceBlossom } from "#src/services/bosses/claimTrounceBlossom";
import { computeDefeatTrounceBlossom } from "#src/services/bosses/computeDefeatTrounceBlossom";
import { computeDefeatWeeklyBossTrounceBlossom } from "#src/services/bosses/computeDefeatWeeklyBossTrounceBlossom";
import { computeTrounceBlossomInteractables } from "#src/services/bosses/computeTrounceBlossomInteractables";
import { computeWeeklyBossRow } from "#src/services/bosses/computeWeeklyBossRow";
import {
  NORMAL_BOSS_ADVENTURE_EXP,
  NORMAL_BOSS_COMPANIONSHIP_EXP,
  WEEKLY_BOSS_ADVENTURE_EXP,
  WEEKLY_BOSS_COMPANIONSHIP_EXP,
} from "#src/services/bosses/constants";
import { drawNormalBossReward } from "#src/services/bosses/drawNormalBossReward";
import { drawWeeklyBossReward } from "#src/services/bosses/drawWeeklyBossReward";
import { getEnemyKind } from "#src/services/enemy/getEnemyKind";
import { getSpawnKey } from "#src/services/enemy/getSpawnKey";
import { gainCompanionshipExp } from "#src/services/friendship/gainCompanionshipExp";
import { BlossomClaimResinMap } from "#src/services/originalResin/BlossomClaimResinMap";
import { computeBlossomClaimPrompt } from "#src/services/originalResin/computeBlossomClaimPrompt";
import { getDeployedCharacterIds } from "#src/services/party/getDeployedCharacterIds";
import { countWeeklyClaims } from "#src/services/weekly/countWeeklyClaims";
import { takeOne } from "@esposter/shared";
import { computed, shallowRef, watch } from "vue";

// The Trounce Blossoms the defeated normal bosses leave where they fell, keyed by the spawn each boss fell under. A
// Blossom waits until it is claimed or the boss respawns after a teleport, and a claim spends the boss's Original Resin
// And grants its World Level's rewards and its own drop, the claim setting the boss's respawn five seconds on. Choosing
// A claim the holdings or the bag cannot pay whole is refused, and the blossom stays as it was
export const useWorldTrounceBlossoms = ({
  characters,
  emitGrant,
  enemyKindMap,
  events,
  friendshipLevels,
  gainWorldAdventureExp,
  gameText,
  getGroundHeight,
  getWorldNow,
  inventory,
  materialDataMap,
  nameText,
  party,
  savedState,
  setInventory,
  setWallet,
  wallet,
  worldNow,
}: WorldBagDependencies & {
  characters: Ref<Character[]>;
  emitGrant: () => void;
  enemyKindMap: ReadonlyMap<number, EnemyKind>;
  events: WorldEvents;
  friendshipLevels: Readonly<Ref<FriendshipLevels | undefined>>;
  gainWorldAdventureExp: (amount: number) => void;
  gameText: Readonly<Record<string, string>>;
  getGroundHeight: (x: number, z: number) => number;
  getWorldNow: () => Temporal.Instant;
  party: Party;
  savedState: Pick<GenshinSaveState, "lastTeleportAt" | "trounceBlossoms">;
  worldNow: Readonly<Ref<Temporal.Instant>>;
}) => {
  const trounceBlossoms = shallowRef<ReadonlyMap<string, TrounceBlossom>>(savedState.trounceBlossoms);
  // The last teleport, which brings back a boss whose blossom is unclaimed, none until the player has teleported
  const lastTeleportAt = shallowRef<Temporal.Instant | undefined>(savedState.lastTeleportAt);
  const claimPrompt = shallowRef<{ offers: BlossomClaimOffer[]; spawnKey: string }>();
  const trounceBlossomInteractables = computed(() =>
    computeTrounceBlossomInteractables(trounceBlossoms.value, gameText, getGroundHeight, worldNow.value),
  );
  const writeTrounceBlossom = (spawnKey: string, trounceBlossom: TrounceBlossom) => {
    trounceBlossoms.value = new Map(trounceBlossoms.value).set(spawnKey, trounceBlossom);
  };
  events.on("defeatEnemy", (enemy: Enemy) => {
    const { enemyType } = getEnemyKind(enemyKindMap, enemy.enemyKindId);
    // A weekly boss's blossom is read first, since a weekly boss is no normal boss whatever its traits say of a drop
    const trounceBlossom =
      computeDefeatWeeklyBossTrounceBlossom(enemy.enemyKindId, enemy.position) ??
      computeDefeatTrounceBlossom(enemyType, enemy.position, enemy.traits.uniqueDropId);
    if (trounceBlossom) writeTrounceBlossom(getSpawnKey(enemy.campId, enemy.id), trounceBlossom);
  });
  events.on("teleport", () => {
    lastTeleportAt.value = getWorldNow();
  });
  // The blossoms and the last teleport are the save's, so a change to either is a grant the host saves
  watch([trounceBlossoms, lastTeleportAt], () => emitGrant(), { flush: "pre" });
  // The blossom of a respawned boss is gone, since it was either claimed or left behind by a teleport
  const forgetTrounceBlossom = (spawnKey: string) => {
    if (!trounceBlossoms.value.has(spawnKey)) return;
    const nextTrounceBlossoms = new Map(trounceBlossoms.value);
    nextTrounceBlossoms.delete(spawnKey);
    trounceBlossoms.value = nextTrounceBlossoms;
  };
  // The claims made this week at every weekly boss, the count a weekly boss's price is read from
  const countWeeklyBossClaims = (now: Temporal.Instant) =>
    countWeeklyClaims(
      [...trounceBlossoms.value.values()].flatMap((trounceBlossom) =>
        trounceBlossom.kind === BlossomKind.WeeklyBoss ? trounceBlossom.claimedAts : [],
      ),
      now,
    );
  const openTrounceBlossomClaim = (spawnKey: string, now: Temporal.Instant) => {
    const trounceBlossom = trounceBlossoms.value.get(spawnKey);
    if (!trounceBlossom || !checkIsTrounceBlossomClaimable(trounceBlossom, now)) return;
    const { offers } = computeBlossomClaimPrompt(
      trounceBlossom.kind,
      countWeeklyBossClaims(now),
      wallet.value,
      inventory.value,
      now,
    );
    claimPrompt.value = offers.length > 0 ? { offers, spawnKey } : undefined;
  };
  const closeTrounceBlossomClaim = () => {
    claimPrompt.value = undefined;
  };
  // A boss's claim pays its Adventure EXP through the rank and its Companionship EXP to the deployed team, as the game does
  const grantBossExp = (adventureAmount: number, companionshipAmount: number, levels: FriendshipLevels) => {
    gainWorldAdventureExp(adventureAmount);
    characters.value = gainCompanionshipExp(
      characters.value,
      getDeployedCharacterIds(party),
      companionshipAmount,
      levels,
    );
  };
  const chooseTrounceBlossomClaim = (now: Temporal.Instant, worldLevel: number, random: () => number) => {
    const prompt = claimPrompt.value;
    const trounceBlossom = prompt && trounceBlossoms.value.get(prompt.spawnKey);
    if (!prompt || !trounceBlossom || !checkIsTrounceBlossomClaimable(trounceBlossom, now) || !friendshipLevels.value)
      return;
    claimPrompt.value = undefined;
    // A weekly boss's prompt holds its one claim, so its single offer is the one paid. The reward is drawn before the resin
    // Is spent, so the random draws keep their order
    const { adventureExp, companionshipExp, resin, rewards } =
      trounceBlossom.kind === BlossomKind.WeeklyBoss
        ? {
            adventureExp: WEEKLY_BOSS_ADVENTURE_EXP,
            companionshipExp: takeOne(WEEKLY_BOSS_COMPANIONSHIP_EXP, computeWeeklyBossRow(worldLevel)),
            resin: takeOne(prompt.offers, 0).resin,
            rewards: drawWeeklyBossReward(worldLevel, random),
          }
        : {
            adventureExp: NORMAL_BOSS_ADVENTURE_EXP,
            companionshipExp: takeOne(NORMAL_BOSS_COMPANIONSHIP_EXP, worldLevel),
            resin: BlossomClaimResinMap[BlossomKind.NormalBoss],
            rewards: drawNormalBossReward(worldLevel, trounceBlossom.uniqueDropId, random),
          };
    const claim = claimTrounceBlossom(wallet.value, inventory.value, resin, rewards, now, nameText, materialDataMap);
    if (!claim) return;
    setWallet(claim.wallet);
    setInventory(claim.inventory);
    grantBossExp(adventureExp, companionshipExp, friendshipLevels.value);
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
