import type { AdventureRankTables } from "#src/models/adventureRank/AdventureRankTables";
import type { Character } from "#src/models/character/Character";
import type { Commission } from "#src/models/commission/Commission";
import type { CommissionDay } from "#src/models/commission/CommissionDay";
import type { CommissionSlice } from "#src/models/commission/CommissionSlice";
import type { EncounterPoints } from "#src/models/commission/EncounterPoints";
import type { LongTermEncounterPoints } from "#src/models/commission/LongTermEncounterPoints";
import type { FriendshipLevels } from "#src/models/friendship/FriendshipLevels";
import type { Inventory } from "#src/models/inventory/Inventory";
import type { MaterialData } from "#src/models/inventory/MaterialData";
import type { Wallet } from "#src/models/inventory/Wallet";

import { useWorldCommissionClaims } from "#src/composables/useWorldCommissionClaims";
import { CombatTalent } from "#src/models/character/CombatTalent";
import { CommissionFinishKind } from "#src/models/commission/CommissionFinishKind";
import { CommissionKind } from "#src/models/commission/CommissionKind";
import { Currency } from "#src/models/inventory/Currency";
import { TRAVELER_CHARACTER_ID } from "#src/services/character/constants";
import { LONG_TERM_MAJOR_VERSION, LONG_TERM_RESIN_COST } from "#src/services/commission/constants";
import { createEmptyBands } from "#src/services/commission/createEmptyBands.test";
import { EMPTY_INVENTORY, EMPTY_WALLET, MORA_ITEM_ID } from "#src/services/inventory/constants";
import { ORIGINAL_RESIN_REGEN_MINUTES } from "#src/services/originalResin/constants";
import { createParty } from "#src/services/party/createParty";
import { createWorldClock } from "#src/services/time/createWorldClock.test";
import { describe, expect, test, vi } from "vitest";
import { computed, shallowRef } from "vue";

describe(useWorldCommissionClaims, () => {
  // No Adventure EXP is routed by these claims, so the rank's tables are left empty rather than read from the game data
  const adventureRankTables: AdventureRankTables = { levels: [], locks: [], worldLevelRows: [] };

  const EPOCH = Temporal.Instant.fromEpochMilliseconds(0);
  // Two days past the epoch, so the latest daily reset falls after the epoch
  const NOW = EPOCH.add({ hours: 48 });
  const DEALT_RANK = 12;
  const FINISH_PROGRESS = 3;
  const FIRST_CHARACTER_ID = 1;
  const BONUS_MORA = 25;
  const MORA_REWARD = 10;
  const REWARD_TIER = 2;
  const STARTING_MORA = 500;
  const CHARACTER: Character = {
    artifacts: [],
    ascension: 0,
    constellationCount: 0,
    friendshipExp: 0,
    id: FIRST_CHARACTER_ID,
    level: 1,
    stellaFortunaCount: 0,
    talentLevels: {
      [CombatTalent.ElementalBurst]: 1,
      [CombatTalent.ElementalSkill]: 1,
      [CombatTalent.NormalAttack]: 1,
    },
    weapon: { ascension: 0, experience: 0, id: 1, level: 1, refinement: 1 },
  };
  const materialDataMap = new Map<number, MaterialData>();
  // Rank 12 is the third band, which pays Mora at its minimum, so a claim's routing is seen in the wallet
  const moraBands = createEmptyBands();
  moraBands[2] = [{ itemId: MORA_ITEM_ID, maxCount: MORA_REWARD, minCount: MORA_REWARD }];
  const commission: Commission = {
    centerPosition: "Event_1",
    enterDistance: 40,
    exitDistance: 60,
    finishKind: CommissionFinishKind.Monster,
    finishProgress: FINISH_PROGRESS,
    id: 1,
    kind: CommissionKind.Scene,
    nameTextId: "1",
    newGroupIds: [],
    oldGroupIds: [],
    poolId: 1001,
    preferredRegion: "mondstadt",
    questId: "",
    rewardTier: REWARD_TIER,
  };
  // Katheryne's bonus pays Mora at the same band in a different amount, so the bonus is told from the reward
  const bonusBands = createEmptyBands();
  bonusBands[2] = [{ itemId: MORA_ITEM_ID, maxCount: BONUS_MORA, minCount: BONUS_MORA }];
  const slice: CommissionSlice = {
    bonuses: bonusBands,
    rewardTiers: [{ bands: moraBands, tier: REWARD_TIER }],
    tasks: [commission],
  };
  const dayWith = (count: number): CommissionDay => ({
    claimedCommissionIds: [],
    dealtAt: NOW,
    dealtCommissions: [{ commissionId: 1, count, dealtRank: DEALT_RANK }],
    isBonusClaimed: false,
  });
  const pointsOf = (halfPoints: number): EncounterPoints => ({ earnedOn: NOW, halfPoints });
  const baseClaims = { halfPoints: 0, longTermHalfPoints: 0, resin: 0 };
  const createClaims = ({
    clock = createWorldClock(NOW),
    day,
    halfPoints,
    longTermHalfPoints,
    resin,
  }: {
    clock?: ReturnType<typeof createWorldClock>;
    day: CommissionDay;
    halfPoints: number;
    longTermHalfPoints: number;
    resin: number;
  }) => {
    const commissionDay = shallowRef(day);
    const encounterPoints = shallowRef<EncounterPoints>(pointsOf(halfPoints));
    const longTermEncounterPoints = shallowRef<LongTermEncounterPoints>({
      halfPoints: longTermHalfPoints,
      majorVersion: LONG_TERM_MAJOR_VERSION,
    });
    const wallet = shallowRef<Wallet>({
      ...EMPTY_WALLET,
      [Currency.Mora]: STARTING_MORA,
      [Currency.OriginalResin]: resin,
      originalResinChangedAt: NOW,
    });
    const adventureExp = shallowRef(0);
    const characters = shallowRef<Character[]>([{ ...CHARACTER, id: TRAVELER_CHARACTER_ID }, CHARACTER]);
    const friendshipLevels = shallowRef<FriendshipLevels | undefined>([
      { exp: 0, level: 1 },
      { exp: 100, level: 2 },
    ]);
    const inventory = shallowRef(EMPTY_INVENTORY);
    const setCharacters = vi.fn<(nextCharacters: Character[]) => void>();
    const setInventory = vi.fn<(nextInventory: Inventory) => void>();
    const setWallet = vi.fn<(nextWallet: Wallet) => void>((nextWallet) => {
      wallet.value = nextWallet;
    });
    const claims = useWorldCommissionClaims({
      adventureExp,
      adventureRankTables,
      characters,
      commissionDay,
      commissionSlice: computed(() => slice),
      completedMainQuestIds: computed(() => new Set<string>()),
      encounterPoints,
      friendshipLevels,
      getWorldNow: clock.getWorldNow,
      inventory,
      longTermEncounterPoints,
      materialDataMap,
      names: {},
      party: createParty([TRAVELER_CHARACTER_ID, FIRST_CHARACTER_ID]),
      rank: computed(() => DEALT_RANK),
      setCharacters,
      setInventory,
      setWallet,
      wallet,
      worldNow: clock.worldNow,
    });
    return { claims, commissionDay, encounterPoints, friendshipLevels, longTermEncounterPoints, setCharacters, wallet };
  };

  test("should claim a finished commission free, routing its Mora into the wallet and recording the claim", () => {
    expect.hasAssertions();
    const { claims, commissionDay, encounterPoints, wallet } = createClaims({
      ...baseClaims,
      day: dayWith(FINISH_PROGRESS),
    });

    claims.claimCommission(commission.id);

    expect(commissionDay.value.claimedCommissionIds).toStrictEqual([commission.id]);
    expect(encounterPoints.value).toStrictEqual(pointsOf(0));
    expect(wallet.value[Currency.Mora]).toBe(STARTING_MORA + MORA_REWARD);
  });

  test("should refuse an unfinished claim with no whole point held, leaving the day and the wallet as they were", () => {
    expect.hasAssertions();
    const day = dayWith(FINISH_PROGRESS - 1);
    const { claims, commissionDay, wallet } = createClaims({ ...baseClaims, day, halfPoints: 1 });

    claims.claimCommission(commission.id);

    expect(commissionDay.value).toBe(day);
    expect(wallet.value[Currency.Mora]).toBe(STARTING_MORA);
  });

  test("should refuse a claim while the friendship levels are unread, leaving the day and the wallet as they were", () => {
    expect.hasAssertions();
    const day = dayWith(FINISH_PROGRESS);
    const { claims, commissionDay, friendshipLevels, setCharacters, wallet } = createClaims({ ...baseClaims, day });
    friendshipLevels.value = undefined;

    claims.claimCommission(commission.id);

    expect(commissionDay.value).toBe(day);
    expect(setCharacters).not.toHaveBeenCalled();
    expect(wallet.value[Currency.Mora]).toBe(STARTING_MORA);
  });

  test("should convert a long-term point for thirty Original Resin, where the daily points are a whole point short", () => {
    expect.hasAssertions();
    const { claims, encounterPoints, longTermEncounterPoints, wallet } = createClaims({
      ...baseClaims,
      day: dayWith(0),
      longTermHalfPoints: 2,
      resin: LONG_TERM_RESIN_COST,
    });
    expect(claims.isLongTermPointConvertible.value).toBe(true);

    claims.convertLongTermPoint();

    expect(encounterPoints.value).toStrictEqual(pointsOf(2));
    expect(longTermEncounterPoints.value).toStrictEqual({ halfPoints: 0, majorVersion: LONG_TERM_MAJOR_VERSION });
    expect(wallet.value[Currency.OriginalResin]).toBe(0);
  });

  test("should offer the conversion once the Original Resin regenerates to its cost, with no wallet write", () => {
    expect.hasAssertions();
    const clock = createWorldClock(NOW);
    const { claims } = createClaims({
      clock,
      ...baseClaims,
      day: dayWith(0),
      longTermHalfPoints: 2,
      resin: LONG_TERM_RESIN_COST - 1,
    });
    expect(claims.isLongTermPointConvertible.value).toBe(false);

    clock.moveTo(NOW.add({ minutes: ORIGINAL_RESIN_REGEN_MINUTES }));

    expect(claims.isLongTermPointConvertible.value).toBe(true);
  });

  test("should refuse Katheryne's bonus until the day's four commissions are claimed", () => {
    expect.hasAssertions();
    const { claims, commissionDay, wallet } = createClaims({ ...baseClaims, day: dayWith(FINISH_PROGRESS) });
    claims.claimKatheryneBonus();
    expect(wallet.value[Currency.Mora]).toBe(STARTING_MORA);
    expect(commissionDay.value.isBonusClaimed).toBe(false);
  });

  test("should pay Katheryne's bonus once the day's four are claimed, into the wallet, and record it once", () => {
    expect.hasAssertions();
    const { claims, commissionDay, wallet } = createClaims({
      ...baseClaims,
      day: { ...dayWith(FINISH_PROGRESS), claimedCommissionIds: [1, 2, 3, 4] },
    });
    claims.claimKatheryneBonus();
    expect(wallet.value[Currency.Mora]).toBe(STARTING_MORA + BONUS_MORA);
    expect(commissionDay.value.isBonusClaimed).toBe(true);
    claims.claimKatheryneBonus();
    expect(wallet.value[Currency.Mora]).toBe(STARTING_MORA + BONUS_MORA);
  });
});
