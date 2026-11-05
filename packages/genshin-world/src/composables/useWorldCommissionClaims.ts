import type { AdventureRankTables } from "#src/models/adventureRank/AdventureRankTables";
import type { CommissionDay } from "#src/models/commission/CommissionDay";
import type { CommissionSlice } from "#src/models/commission/CommissionSlice";
import type { EncounterPoints } from "#src/models/commission/EncounterPoints";
import type { LongTermEncounterPoints } from "#src/models/commission/LongTermEncounterPoints";
import type { RewardRouting } from "#src/models/reward/RewardRouting";
import type { ComputedRef, Ref } from "vue";

import { claimCommissionWithPoints } from "#src/services/commission/claimCommissionWithPoints";
import { computeEncounterPointStorage } from "#src/services/commission/computeEncounterPointStorage";
import { LONG_TERM_MAJOR_VERSION } from "#src/services/commission/constants";
import { convertLongTermEncounterPoint } from "#src/services/commission/convertLongTermEncounterPoint";
import { routeCommissionClaim } from "#src/services/commission/routeCommissionClaim";
import { takeKatheryneBonus } from "#src/services/commission/takeKatheryneBonus";
import { useWorldAdventureRankStore } from "#src/store/adventureRank";
import { useWorldFriendshipStore } from "#src/store/friendship";
import { useWorldPartyStore } from "#src/store/party";
import { useWorldSessionStore } from "#src/store/session";
import { storeToRefs } from "pinia";
import { computed } from "vue";

// The claims a screen makes with the points the save holds: a dealt commission claimed for its reward, free when it is
// Finished and for a whole Encounter Point when it is not, and a Long-Term Encounter Point converted for Original Resin. What
// A claim leaves is written back to the session's state, the day and the points held here and the rest where it is kept
export const useWorldCommissionClaims = ({
  adventureRankTables,
  commissionDay,
  commissionSlice,
  encounterPoints,
  longTermEncounterPoints,
}: {
  adventureRankTables: AdventureRankTables;
  commissionDay: Ref<CommissionDay>;
  commissionSlice: ComputedRef<CommissionSlice | undefined>;
  encounterPoints: Ref<EncounterPoints>;
  longTermEncounterPoints: Ref<LongTermEncounterPoints>;
}) => {
  const worldPartyStore = useWorldPartyStore();
  const { characters } = storeToRefs(worldPartyStore);
  const { party } = worldPartyStore;
  const worldFriendshipStore = useWorldFriendshipStore();
  const { friendshipLevels } = storeToRefs(worldFriendshipStore);
  const worldAdventureRankStore = useWorldAdventureRankStore();
  const { adventureExp, completedMainQuestIds, rank } = storeToRefs(worldAdventureRankStore);
  const worldSessionStore = useWorldSessionStore();
  const { inventory, wallet, worldNow } = storeToRefs(worldSessionStore);
  const { getWorldNow, setInventory, setWallet } = worldSessionStore;
  // Where a routing's items land: the Adventure EXP, the characters, the bag and the wallet
  const writeRouting = (routing: RewardRouting) => {
    adventureExp.value = routing.adventureExp;
    characters.value = routing.characters;
    setInventory(routing.inventory);
    setWallet(routing.wallet);
  };
  // A dealt commission claimed: nothing changes where the claim is refused, and the rewards are routed where they are kept
  const claimCommission = (commissionId: number) => {
    const slice = commissionSlice.value;
    if (!slice || !friendshipLevels.value) return;
    const outcome = claimCommissionWithPoints({
      adventureExp: adventureExp.value,
      adventureRankTables,
      characters: characters.value,
      commissionDay: commissionDay.value,
      commissionId,
      completedMainQuestIds: completedMainQuestIds.value,
      encounterPoints: encounterPoints.value,
      friendshipLevels: friendshipLevels.value,
      inventory: inventory.value,
      materialDataMap: worldSessionStore.materialDataMap,
      names: worldSessionStore.nameText,
      now: getWorldNow(),
      party,
      random: Math.random,
      slice,
      wallet: wallet.value,
    });
    if (!outcome) return;
    commissionDay.value = outcome.commissionDay;
    encounterPoints.value = outcome.encounterPoints;
    writeRouting(outcome.routing);
  };
  // Katheryne's bonus, given once the day's four commissions are claimed: its items are routed as a claim's are, and the day
  // Records it, so a second talk gives nothing
  const claimKatheryneBonus = () => {
    const slice = commissionSlice.value;
    if (!slice || !friendshipLevels.value) return;
    const bonusClaim = takeKatheryneBonus(commissionDay.value, slice, rank.value, Math.random);
    if (!bonusClaim) return;
    const routing = routeCommissionClaim(
      adventureRankTables,
      adventureExp.value,
      characters.value,
      bonusClaim.bonus,
      completedMainQuestIds.value,
      friendshipLevels.value,
      inventory.value,
      worldSessionStore.materialDataMap,
      worldSessionStore.nameText,
      party,
      wallet.value,
    );
    if (!routing) return;
    commissionDay.value = bonusClaim.day;
    writeRouting(routing);
  };
  // The conversion of a Long-Term Encounter Point at a moment, made for the Original Resin it costs where the daily points fall short
  const computeConversion = (now: Temporal.Instant) =>
    convertLongTermEncounterPoint({
      encounterPoints: encounterPoints.value,
      longTermEncounterPoints: longTermEncounterPoints.value,
      majorVersion: LONG_TERM_MAJOR_VERSION,
      now,
      storage: computeEncounterPointStorage(commissionDay.value, commissionSlice.value),
      wallet: wallet.value,
    });
  // Offered by the world's clock, so a resin that regenerates or a reset that passes with no write is seen
  const isLongTermPointConvertible = computed(() => computeConversion(worldNow.value) !== undefined);
  const convertLongTermPoint = () => {
    const conversion = computeConversion(getWorldNow());
    if (!conversion) return;
    encounterPoints.value = conversion.encounterPoints;
    longTermEncounterPoints.value = conversion.longTermEncounterPoints;
    setWallet(conversion.wallet);
  };
  return { claimCommission, claimKatheryneBonus, convertLongTermPoint, isLongTermPointConvertible };
};
