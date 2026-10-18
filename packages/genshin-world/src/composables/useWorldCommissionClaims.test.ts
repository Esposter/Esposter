import type { AdventureRankTables } from "#src/models/adventureRank/AdventureRankTables";
import type { Character } from "#src/models/character/Character";
import type { Commission } from "#src/models/commission/Commission";
import type { CommissionDay } from "#src/models/commission/CommissionDay";
import type { CommissionSlice } from "#src/models/commission/CommissionSlice";
import type { EncounterPoints } from "#src/models/commission/EncounterPoints";
import type { LongTermEncounterPoints } from "#src/models/commission/LongTermEncounterPoints";
import type { Inventory } from "#src/models/inventory/Inventory";
import type { MaterialData } from "#src/models/inventory/MaterialData";
import type { RewardItem } from "#src/models/reward/RewardItem";
import type { Wallet } from "#src/models/inventory/Wallet";

import { useWorldCommissionClaims } from "#src/composables/useWorldCommissionClaims";
import { CombatTalent } from "#src/models/character/CombatTalent";
import { CommissionFinishKind } from "#src/models/commission/CommissionFinishKind";
import { CommissionKind } from "#src/models/commission/CommissionKind";
import { Currency } from "#src/models/inventory/Currency";
import { TRAVELER_CHARACTER_ID } from "#src/services/character/constants";
import {
  COMMISSION_RANK_BAND_COUNT,
  LONG_TERM_MAJOR_VERSION,
  LONG_TERM_RESIN_COST,
} from "#src/services/commission/constants";
import { EMPTY_INVENTORY, EMPTY_WALLET, MORA_ITEM_ID } from "#src/services/inventory/constants";
import { createParty } from "#src/services/party/createParty";
import { computed, shallowRef } from "vue";
import { describe, expect, test, vi } from "vitest";

// No Adventure EXP is routed by these claims, so the rank's tables are left empty rather than read from the game data
const adventureRankTables: AdventureRankTables = { levels: [], locks: [], worldLevelRows: [] };

const emptyBands = (): RewardItem[][] => Array.from({ length: COMMISSION_RANK_BAND_COUNT }, (): RewardItem[] => []);

describe(useWorldCommissionClaims, () => {
  const EPOCH = Temporal.Instant.fromEpochMilliseconds(0);
  // Two days past the epoch, so the latest daily reset falls after the epoch
  const NOW = EPOCH.add({ hours: 48 });
  const DEALT_RANK = 12;
  const FINISH_PROGRESS = 3;
  const FIRST_CHARACTER_ID = 1;
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
  const moraBands = emptyBands();
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
  const slice: CommissionSlice = {
    bonuses: emptyBands(),
    rewardTiers: [{ bands: moraBands, tier: REWARD_TIER }],
    tasks: [commission],
  };
  const dayWith = (count: number): CommissionDay => ({
    claimedCommissionIds: [],
    dealtAt: NOW,
    dealtCommissions: [{ commissionId: 1, count, dealtRank: DEALT_RANK }],
  });
  const pointsOf = (halfPoints: number): EncounterPoints => ({ earnedOn: NOW, halfPoints });
  const createClaims = ({
    day,
    halfPoints,
    longTermHalfPoints,
    resin,
  }: {
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
      friendshipLevels: shallowRef([
        { exp: 0, level: 1 },
        { exp: 100, level: 2 },
      ]),
      getWorldNow: () => NOW,
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
    });
    return { claims, commissionDay, encounterPoints, longTermEncounterPoints, wallet };
  };

  test("should claim a finished commission free, routing its Mora into the wallet and recording the claim", () => {
    expect.hasAssertions();
    const { claims, commissionDay, encounterPoints, wallet } = createClaims({
      day: dayWith(FINISH_PROGRESS),
      halfPoints: 0,
      longTermHalfPoints: 0,
      resin: 0,
    });

    claims.claimCommission(commission.id);

    expect(commissionDay.value.claimedCommissionIds).toStrictEqual([commission.id]);
    expect(encounterPoints.value).toStrictEqual(pointsOf(0));
    expect(wallet.value[Currency.Mora]).toBe(STARTING_MORA + MORA_REWARD);
  });

  test("should refuse an unfinished claim with no whole point held, leaving the day and the wallet as they were", () => {
    expect.hasAssertions();
    const day = dayWith(FINISH_PROGRESS - 1);
    const { claims, commissionDay, wallet } = createClaims({ day, halfPoints: 1, longTermHalfPoints: 0, resin: 0 });

    claims.claimCommission(commission.id);

    expect(commissionDay.value).toBe(day);
    expect(wallet.value[Currency.Mora]).toBe(STARTING_MORA);
  });

  test("should convert a long-term point for thirty Original Resin, where the daily points are a whole point short", () => {
    expect.hasAssertions();
    const { claims, encounterPoints, longTermEncounterPoints, wallet } = createClaims({
      day: dayWith(0),
      halfPoints: 0,
      longTermHalfPoints: 2,
      resin: LONG_TERM_RESIN_COST,
    });
    expect(claims.canConvertLongTermPoint.value).toBe(true);

    claims.convertLongTermPoint();

    expect(encounterPoints.value).toStrictEqual(pointsOf(2));
    expect(longTermEncounterPoints.value).toStrictEqual({ halfPoints: 0, majorVersion: LONG_TERM_MAJOR_VERSION });
    expect(wallet.value[Currency.OriginalResin]).toBe(0);
  });
});
