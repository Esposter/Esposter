import type { Character } from "#src/models/character/Character";
import type { Commission } from "#src/models/commission/Commission";
import type { CommissionDay } from "#src/models/commission/CommissionDay";
import type { CommissionSlice } from "#src/models/commission/CommissionSlice";
import type { FriendshipLevel } from "#src/models/friendship/FriendshipLevel";
import type { Inventory } from "#src/models/inventory/Inventory";
import type { MaterialData } from "#src/models/inventory/MaterialData";
import type { RewardItem } from "#src/models/reward/RewardItem";

import { GAME_DATA_LOCAL_BASE_URL } from "#scripts/gameData/constants";
import { CombatTalent } from "#src/models/character/CombatTalent";
import { CommissionFinishKind } from "#src/models/commission/CommissionFinishKind";
import { CommissionKind } from "#src/models/commission/CommissionKind";
import { Currency } from "#src/models/inventory/Currency";
import { MaterialType } from "#src/models/inventory/MaterialType";
import { readAdventureRankTables } from "#src/services/adventureRank/readAdventureRankTables";
import { TRAVELER_CHARACTER_ID } from "#src/services/character/constants";
import { claimCommissionWithPoints } from "#src/services/commission/claimCommissionWithPoints";
import { COMMISSION_RANK_BAND_COUNT } from "#src/services/commission/constants";
import { EMPTY_INVENTORY, EMPTY_WALLET, MORA_ITEM_ID } from "#src/services/inventory/constants";
import { getItemDefinition } from "#src/services/inventory/getItemDefinition";
import { createParty } from "#src/services/party/createParty";
import { describe, expect, test } from "vitest";

const adventureRankTables = await readAdventureRankTables(GAME_DATA_LOCAL_BASE_URL);

const emptyBands = (): RewardItem[][] => Array.from({ length: COMMISSION_RANK_BAND_COUNT }, (): RewardItem[] => []);
const minimumRoll = () => 0;

describe(claimCommissionWithPoints, () => {
  const EPOCH = Temporal.Instant.fromEpochMilliseconds(0);
  // Two days past the epoch, so the latest daily reset falls after the epoch and points earned at the epoch are stale
  const NOW = EPOCH.add({ hours: 48 });
  const DEALT_RANK = 12;
  const FINISH_PROGRESS = 3;
  const FIRST_CHARACTER_ID = 1;
  const ITEM_ID = 2000;
  const MORA_REWARD = 10;
  const NAME_TEXT_ID = "1";
  const REWARD_TIER = 2;
  const STARTING_MORA = 500;
  const names: Readonly<Record<string, string>> = { [NAME_TEXT_ID]: "Test Item" };
  const materialDataMap = new Map<number, MaterialData>([
    [
      ITEM_ID,
      { id: ITEM_ID, materialType: MaterialType.Exchange, nameTextId: NAME_TEXT_ID, rank: 1, rarity: 1, stackLimit: 5 },
    ],
  ]);
  const FRIENDSHIP_LEVELS: FriendshipLevel[] = [
    { exp: 0, level: 1 },
    { exp: 100, level: 2 },
  ];
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
  // Rank 12 is the third band, which pays the Mora reward at its minimum, so a claim's routing is seen in the wallet
  const moraBands = emptyBands();
  moraBands[2] = [{ itemId: MORA_ITEM_ID, maxCount: 20, minCount: MORA_REWARD }];
  const itemBands = emptyBands();
  itemBands[2] = [{ itemId: ITEM_ID, maxCount: 1, minCount: 1 }];
  const commissionOf = (id: number): Commission => ({
    centerPosition: `Event_${id}`,
    enterDistance: 40,
    exitDistance: 60,
    finishKind: CommissionFinishKind.Monster,
    finishProgress: FINISH_PROGRESS,
    id,
    kind: CommissionKind.Scene,
    nameTextId: "1",
    newGroupIds: [],
    oldGroupIds: [],
    poolId: 1001,
    preferredRegion: "mondstadt",
    questId: "",
    rewardTier: REWARD_TIER,
  });
  const sliceWith = (bands: RewardItem[][]): CommissionSlice => ({
    bonuses: emptyBands(),
    rewardTiers: [{ bands, tier: REWARD_TIER }],
    tasks: [commissionOf(1)],
  });
  const dayWith = (count: number): CommissionDay => ({
    claimedCommissionIds: [],
    dealtAt: NOW,
    dealtCommissions: [{ commissionId: 1, count, dealtRank: DEALT_RANK }],
  });
  const pointsOf = (halfPoints: number) => ({ earnedOn: NOW, halfPoints });
  const base = {
    adventureExp: 0,
    adventureRankTables,
    characters: [{ ...CHARACTER, id: TRAVELER_CHARACTER_ID }, CHARACTER],
    commissionId: 1,
    completedMainQuestIds: new Set<string>(),
    friendshipLevels: FRIENDSHIP_LEVELS,
    inventory: EMPTY_INVENTORY,
    materialDataMap,
    names,
    now: NOW,
    party: createParty([TRAVELER_CHARACTER_ID, FIRST_CHARACTER_ID]),
    rank: DEALT_RANK,
    random: minimumRoll,
    wallet: { ...EMPTY_WALLET, [Currency.Mora]: STARTING_MORA },
  };

  test("should refuse an unfinished commission held less than one whole point, and spend nothing", () => {
    expect.hasAssertions();

    expect(
      claimCommissionWithPoints({
        ...base,
        commissionDay: dayWith(FINISH_PROGRESS - 1),
        encounterPoints: pointsOf(1),
        slice: sliceWith(moraBands),
      }),
    ).toBeUndefined();
  });

  test("should claim an unfinished commission for a whole point, spending two half points and keeping the half", () => {
    expect.hasAssertions();

    const outcome = claimCommissionWithPoints({
      ...base,
      commissionDay: dayWith(FINISH_PROGRESS - 1),
      encounterPoints: pointsOf(3),
      slice: sliceWith(moraBands),
    });

    expect(outcome?.encounterPoints).toStrictEqual(pointsOf(1));
    expect(outcome?.commissionDay.claimedCommissionIds).toStrictEqual([1]);
    expect(outcome?.routing.wallet[Currency.Mora]).toBe(STARTING_MORA + MORA_REWARD);
  });

  test("should claim a finished commission free, keeping the half points it holds", () => {
    expect.hasAssertions();

    const outcome = claimCommissionWithPoints({
      ...base,
      commissionDay: dayWith(FINISH_PROGRESS),
      encounterPoints: pointsOf(3),
      slice: sliceWith(moraBands),
    });

    expect(outcome?.encounterPoints).toStrictEqual(pointsOf(3));
    expect(outcome?.commissionDay.claimedCommissionIds).toStrictEqual([1]);
  });

  test("should read points earned before the daily reset as none, so an unfinished commission is refused", () => {
    expect.hasAssertions();

    expect(
      claimCommissionWithPoints({
        ...base,
        commissionDay: dayWith(FINISH_PROGRESS - 1),
        encounterPoints: { earnedOn: EPOCH, halfPoints: 8 },
        slice: sliceWith(moraBands),
      }),
    ).toBeUndefined();
  });

  test("should refuse a claim the bag cannot take whole, so the point is not spent", () => {
    expect.hasAssertions();

    const fullInventory: Inventory = {
      items: [{ definition: getItemDefinition(ITEM_ID, names, materialDataMap), id: 0, quantity: 5 }],
      nextId: 1,
    };

    expect(
      claimCommissionWithPoints({
        ...base,
        commissionDay: dayWith(FINISH_PROGRESS - 1),
        encounterPoints: pointsOf(2),
        inventory: fullInventory,
        slice: sliceWith(itemBands),
      }),
    ).toBeUndefined();
  });
});
