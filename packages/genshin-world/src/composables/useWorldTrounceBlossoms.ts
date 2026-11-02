import type { TrounceBlossom } from "#src/models/bosses/TrounceBlossom";
import type { Character } from "#src/models/character/Character";
import type { Enemy } from "#src/models/enemy/Enemy";
import type { EnemyKind } from "#src/models/enemy/EnemyKind";
import type { FriendshipLevels } from "#src/models/friendship/FriendshipLevels";
import type { BlossomClaimOffer } from "#src/models/originalResin/BlossomClaimOffer";
import type { Party } from "#src/models/party/Party";
import type { GenshinSaveState } from "#src/models/save/GenshinSaveState";
import type { Catalogue } from "#src/models/world/Catalogue";
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
import { findAreaAt } from "#src/services/map/findAreaAt";
import { BlossomClaimResinMap } from "#src/services/originalResin/BlossomClaimResinMap";
import { computeBlossomClaimPrompt } from "#src/services/originalResin/computeBlossomClaimPrompt";
import { getDeployedCharacterIds } from "#src/services/party/getDeployedCharacterIds";
import { withoutMapEntry } from "#src/services/shared/withoutMapEntry";
import { countWeeklyClaims } from "#src/services/weekly/countWeeklyClaims";
import { useWorldAdventureRankStore } from "#src/store/adventureRank";
import { useWorldSessionStore } from "#src/store/session";
import { takeOne } from "@esposter/shared";
import { storeToRefs } from "pinia";
import { computed, shallowRef, watch } from "vue";

// The Trounce Blossoms the defeated normal bosses leave where they fell, keyed by the spawn each boss fell under. A
// Blossom waits until it is claimed or its boss is released by a teleport out of its area, and a claim spends the boss's
// Original Resin and grants its World Level's rewards and its own drop, the claim setting the boss's respawn five seconds
// On. Choosing a claim the holdings or the bag cannot pay whole is refused, and the blossom stays as it was
export const useWorldTrounceBlossoms = ({
  catalogue,
  characters,
  emitGrant,
  enemyKindMap,
  friendshipLevels,
  getGroundHeight,
  party,
  savedState,
}: {
  catalogue: Catalogue;
  characters: Ref<Character[]>;
  emitGrant: () => void;
  enemyKindMap: ReadonlyMap<number, EnemyKind>;
  friendshipLevels: Readonly<Ref<FriendshipLevels | undefined>>;
  getGroundHeight: (x: number, z: number) => number;
  party: Party;
  savedState: Pick<GenshinSaveState, "lastTeleportAts" | "trounceBlossoms">;
}) => {
  const worldAdventureRankStore = useWorldAdventureRankStore();
  const { gainWorldAdventureExp } = worldAdventureRankStore;
  const worldSessionStore = useWorldSessionStore();
  const { inventory, wallet, worldNow } = storeToRefs(worldSessionStore);
  const { events, getWorldNow, setInventory, setWallet } = worldSessionStore;
  const trounceBlossoms = shallowRef<ReadonlyMap<string, TrounceBlossom>>(savedState.trounceBlossoms);
  // The last teleport into each area, which holds a boss down until a teleport lands outside its area after its defeat
  const lastTeleportAts = shallowRef<ReadonlyMap<string, Temporal.Instant>>(savedState.lastTeleportAts);
  const claimPrompt = shallowRef<{ offers: BlossomClaimOffer[]; spawnKey: string }>();
  const trounceBlossomInteractables = computed(() =>
    computeTrounceBlossomInteractables(
      trounceBlossoms.value,
      worldSessionStore.gameText,
      getGroundHeight,
      worldNow.value,
    ),
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
  // A teleport is kept as the last one into the area it lands in, the landing outside every area under the empty id
  events.on("teleport", ({ point }) => {
    const landedAreaId = findAreaAt(catalogue, point.x, point.z)?.id ?? "";
    lastTeleportAts.value = new Map(lastTeleportAts.value).set(landedAreaId, getWorldNow());
  });
  // The blossoms and the last teleports are the save's, so a change to either is a grant the host saves
  watch(
    [trounceBlossoms, lastTeleportAts],
    () => {
      emitGrant();
    },
    { flush: "pre" },
  );
  // The blossom of a respawned boss is gone, since it was either claimed or left behind by a teleport
  const forgetTrounceBlossom = (spawnKey: string) => {
    trounceBlossoms.value = withoutMapEntry(trounceBlossoms.value, spawnKey);
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
    const claim = claimTrounceBlossom(
      wallet.value,
      inventory.value,
      resin,
      rewards,
      now,
      worldSessionStore.nameText,
      worldSessionStore.materialDataMap,
    );
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
    lastTeleportAts,
    openTrounceBlossomClaim,
    trounceBlossomInteractables,
    trounceBlossoms,
  };
};
