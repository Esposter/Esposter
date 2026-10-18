import type { AdventureRankTables } from "#src/models/adventureRank/AdventureRankTables";
import type { Character } from "#src/models/character/Character";
import type { CommissionDay } from "#src/models/commission/CommissionDay";
import type { CommissionRouting } from "#src/models/commission/CommissionRouting";
import type { CommissionSlice } from "#src/models/commission/CommissionSlice";
import type { EncounterPoints } from "#src/models/commission/EncounterPoints";
import type { LongTermEncounterPoints } from "#src/models/commission/LongTermEncounterPoints";
import type { FriendshipLevel } from "#src/models/friendship/FriendshipLevel";
import type { Inventory } from "#src/models/inventory/Inventory";
import type { MaterialData } from "#src/models/inventory/MaterialData";
import type { Wallet } from "#src/models/inventory/Wallet";
import type { Party } from "#src/models/party/Party";
import type { ComputedRef, Ref } from "vue";

import { claimCommissionWithPoints } from "#src/services/commission/claimCommissionWithPoints";
import { computeEncounterPointStorage } from "#src/services/commission/computeEncounterPointStorage";
import { LONG_TERM_MAJOR_VERSION } from "#src/services/commission/constants";
import { convertLongTermEncounterPoint } from "#src/services/commission/convertLongTermEncounterPoint";
import { routeCommissionClaim } from "#src/services/commission/routeCommissionClaim";
import { takeKatheryneBonus } from "#src/services/commission/takeKatheryneBonus";
import { computed } from "vue";

// The claims a screen makes with the points the save holds: a dealt commission claimed for its reward, free when it is
// Finished and for a whole Encounter Point when it is not, and a Long-Term Encounter Point converted for Original Resin. What
// A claim leaves is written back to the session's state, the day and the points held here and the rest where it is kept
export const useWorldCommissionClaims = ({
  adventureExp,
  adventureRankTables,
  characters,
  commissionDay,
  commissionSlice,
  completedMainQuestIds,
  encounterPoints,
  friendshipLevels,
  getWorldNow,
  inventory,
  longTermEncounterPoints,
  materialDataMap,
  names,
  party,
  rank,
  setCharacters,
  setInventory,
  setWallet,
  wallet,
}: {
  adventureExp: Ref<number>;
  adventureRankTables: AdventureRankTables;
  characters: Ref<Character[]>;
  commissionDay: Ref<CommissionDay>;
  commissionSlice: ComputedRef<CommissionSlice | undefined>;
  completedMainQuestIds: ComputedRef<ReadonlySet<string>>;
  encounterPoints: Ref<EncounterPoints>;
  friendshipLevels: Ref<FriendshipLevel[]>;
  getWorldNow: () => Temporal.Instant;
  inventory: Ref<Inventory>;
  longTermEncounterPoints: Ref<LongTermEncounterPoints>;
  materialDataMap: ReadonlyMap<number, MaterialData>;
  names: Readonly<Record<string, string>>;
  party: Party;
  rank: ComputedRef<number>;
  setCharacters: (nextCharacters: Character[]) => void;
  setInventory: (nextInventory: Inventory) => void;
  setWallet: (nextWallet: Wallet) => void;
  wallet: Ref<Wallet>;
}) => {
  // Where a routing's items land: the Adventure EXP, the characters, the bag and the wallet
  const writeRouting = (routing: CommissionRouting) => {
    adventureExp.value = routing.adventureExp;
    setCharacters(routing.characters);
    setInventory(routing.inventory);
    setWallet(routing.wallet);
  };
  // A dealt commission claimed: nothing changes where the claim is refused, and the rewards are routed where they are kept
  const claimCommission = (commissionId: number) => {
    const slice = commissionSlice.value;
    if (!slice) return;
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
      materialDataMap,
      names,
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
    if (!slice) return;
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
      materialDataMap,
      names,
      party,
      wallet.value,
    );
    if (!routing) return;
    commissionDay.value = bonusClaim.day;
    writeRouting(routing);
  };
  // The conversion of a Long-Term Encounter Point, made for the Original Resin it costs where the daily points fall short
  const computeConversion = () =>
    convertLongTermEncounterPoint({
      encounterPoints: encounterPoints.value,
      longTermEncounterPoints: longTermEncounterPoints.value,
      majorVersion: LONG_TERM_MAJOR_VERSION,
      now: getWorldNow(),
      storage: computeEncounterPointStorage(commissionDay.value, commissionSlice.value),
      wallet: wallet.value,
    });
  const canConvertLongTermPoint = computed(() => computeConversion() !== undefined);
  const convertLongTermPoint = () => {
    const conversion = computeConversion();
    if (!conversion) return;
    encounterPoints.value = conversion.encounterPoints;
    longTermEncounterPoints.value = conversion.longTermEncounterPoints;
    setWallet(conversion.wallet);
  };
  return { canConvertLongTermPoint, claimCommission, claimKatheryneBonus, convertLongTermPoint };
};
