import type { Character } from "#src/models/character/Character";
import type { Enemy } from "#src/models/enemy/Enemy";
import type { FriendshipLevel } from "#src/models/friendship/FriendshipLevel";
import type { Inventory } from "#src/models/inventory/Inventory";
import type { Wallet } from "#src/models/inventory/Wallet";
import type { OutcropKindRule } from "#src/models/leyLine/OutcropKindRule";

import { GAME_DATA_LOCAL_BASE_URL } from "#scripts/gameData/constants";
import { useWorldOutcrops } from "#src/composables/useWorldOutcrops";
import { CombatTalent } from "#src/models/character/CombatTalent";
import { EnemyState } from "#src/models/enemy/EnemyState";
import { Currency } from "#src/models/inventory/Currency";
import { OutcropKind } from "#src/models/leyLine/OutcropKind";
import { OutcropStage } from "#src/models/leyLine/OutcropStage";
import { BlossomKind } from "#src/models/originalResin/BlossomKind";
import { readAdventureRankTables } from "#src/services/adventureRank/readAdventureRankTables";
import { EMPTY_INVENTORY, EMPTY_WALLET, MORA_ITEM_ID } from "#src/services/inventory/constants";
import { BlossomClaimResinMap } from "#src/services/originalResin/BlossomClaimResinMap";
import { ADVENTURE_EXP_PER_RESIN } from "#src/services/originalResin/constants";
import { BlossomCompanionshipExpMap } from "#src/services/originalResin/BlossomCompanionshipExpMap";
import { createParty } from "#src/services/party/createParty";
import { createWorldEvents } from "#src/services/world/createWorldEvents";
import { takeOne } from "@esposter/shared";
import { describe, expect, test } from "vitest";
import { ref } from "vue";

const adventureRankTables = await readAdventureRankTables(GAME_DATA_LOCAL_BASE_URL);
const CHARACTER_ID = 1;
const BENCHED_CHARACTER_ID = 2;
const FRIENDSHIP_LEVELS: FriendshipLevel[] = [
  { exp: 0, level: 1 },
  { exp: 1000, level: 2 },
];
const createCharacter = (id: number): Character => ({
  artifacts: [],
  ascension: 0,
  constellationCount: 0,
  friendshipExp: 0,
  id,
  level: 1,
  stellaFortunaCount: 0,
  talentLevels: { [CombatTalent.ElementalBurst]: 1, [CombatTalent.ElementalSkill]: 1, [CombatTalent.NormalAttack]: 1 },
  weapon: { ascension: 0, experience: 0, id: 1, level: 1, refinement: 1 },
});
const PLACEMENTS = [
  { id: 1, position: { x: 0, z: 0 } },
  { id: 2, position: { x: 100, z: 0 } },
];
const KIND_RULES: OutcropKindRule[] = [
  {
    kind: OutcropKind.Revelation,
    playerLevel: 1,
    unlockCityIds: [],
    worldLevelRewards: [[{ itemId: MORA_ITEM_ID, maxCount: 100, minCount: 100 }]],
  },
];
const epoch = Temporal.Instant.fromEpochMilliseconds(0);

// A region's outcrops, with a held wallet of resin enough for two claims at a ley line, and the setters writing back
const createOutcrops = (resin = BlossomClaimResinMap[BlossomKind.LeyLine] * 2) => {
  const events = createWorldEvents();
  const adventureExp = ref(0);
  const wallet = ref<Wallet>({ ...EMPTY_WALLET, [Currency.OriginalResin]: resin });
  const characters = ref<Character[]>([createCharacter(CHARACTER_ID), createCharacter(BENCHED_CHARACTER_ID)]);
  const inventory = ref<Inventory>({ ...EMPTY_INVENTORY });
  const outcrops = useWorldOutcrops({
    adventureExp,
    adventureRankTables,
    areaId: ref("mondstadt"),
    characters,
    completedMainQuestIds: ref(new Set<string>()),
    enemyMap: new Map(),
    events,
    gameDataBaseUrl: GAME_DATA_LOCAL_BASE_URL,
    gameText: {},
    getGroundHeight: () => 0,
    inventory,
    materialDataMap: new Map(),
    nameText: {},
    party: createParty([CHARACTER_ID]),
    placements: ref(PLACEMENTS),
    rank: ref(30),
    regionStatueProgressMap: ref(new Map()),
    setInventory: (nextInventory) => {
      inventory.value = nextInventory;
    },
    setWallet: (nextWallet) => {
      wallet.value = nextWallet;
    },
    wallet,
  });
  outcrops.kindRules.value = KIND_RULES;
  outcrops.friendshipLevels.value = FRIENDSHIP_LEVELS;
  outcrops.drawDayOutcrops(epoch, () => 0);
  outcrops.touchOutcropsNear(0, 0, () => 0);
  // The defeat of the camp's only enemy, which reveals the blossom
  events.emit("defeatEnemy", { campId: "outcrop-1", id: "0", state: EnemyState.Dead } as Enemy);
  return { adventureExp, characters, events, outcrops, wallet };
};

describe("useWorldOutcrops", () => {
  test("a touch spawns the outcrop's camp, and the last enemy's defeat leaves it claimable", () => {
    expect.hasAssertions();

    const { outcrops } = createOutcrops();
    expect(outcrops.outcropCamps.value).toStrictEqual([]);
    expect(outcrops.outcropInteractables.value.map(({ id }) => id)).toStrictEqual(["1"]);
  });

  test("pressing F at a cleared challenge's blossom offers its claims", () => {
    expect.hasAssertions();

    const { outcrops } = createOutcrops();
    outcrops.openOutcropClaim(1, epoch);
    expect(outcrops.claimPrompt.value?.offers.length).toBeGreaterThan(0);
  });

  test("choosing an offer spends its resin and grants its rewards", () => {
    expect.hasAssertions();

    const { adventureExp, outcrops, wallet } = createOutcrops();
    outcrops.openOutcropClaim(1, epoch);
    outcrops.chooseOutcropClaim(takeOne(outcrops.claimPrompt.value?.offers ?? [], 0), epoch, 0, () => 0);

    expect(wallet.value[Currency.OriginalResin]).toBe(BlossomClaimResinMap[BlossomKind.LeyLine]);
    expect(wallet.value[Currency.Mora]).toBe(EMPTY_WALLET[Currency.Mora] + 100);
    expect(adventureExp.value).toBe(ADVENTURE_EXP_PER_RESIN * BlossomClaimResinMap[BlossomKind.LeyLine]);
    expect(outcrops.outcrops.value).toStrictEqual([
      { kind: OutcropKind.Revelation, placeId: 2, stage: OutcropStage.Waiting },
    ]);
  });

  test("a claim gives each deployed character the claim's Companionship EXP, and a benched one none", () => {
    expect.hasAssertions();

    const { characters, outcrops } = createOutcrops();
    outcrops.openOutcropClaim(1, epoch);
    const offer = takeOne(outcrops.claimPrompt.value?.offers ?? [], 0);
    outcrops.chooseOutcropClaim(offer, epoch, 0, () => 0);

    expect(characters.value.map(({ friendshipExp, id }) => ({ friendshipExp, id }))).toStrictEqual([
      { friendshipExp: BlossomCompanionshipExpMap[BlossomKind.LeyLine] * offer.claimCount, id: CHARACTER_ID },
      { friendshipExp: 0, id: BENCHED_CHARACTER_ID },
    ]);
  });

  test("a claim waits until the friendship levels are loaded, and keeps its prompt and its resin", () => {
    expect.hasAssertions();

    const { characters, outcrops, wallet } = createOutcrops();
    outcrops.friendshipLevels.value = [];
    outcrops.openOutcropClaim(1, epoch);
    outcrops.chooseOutcropClaim(takeOne(outcrops.claimPrompt.value?.offers ?? [], 0), epoch, 0, () => 0);

    expect(outcrops.claimPrompt.value).toBeDefined();
    expect(wallet.value[Currency.OriginalResin]).toBe(BlossomClaimResinMap[BlossomKind.LeyLine] * 2);
    expect(characters.value.map(({ friendshipExp }) => friendshipExp)).toStrictEqual([0, 0]);
  });

  test("a cleared challenge never claimed gives nothing", () => {
    expect.hasAssertions();

    const { outcrops, wallet } = createOutcrops();
    outcrops.openOutcropClaim(1, epoch);
    outcrops.closeOutcropClaim();

    expect(outcrops.claimPrompt.value).toBeUndefined();
    expect(wallet.value[Currency.Mora]).toBe(EMPTY_WALLET[Currency.Mora]);
    expect(outcrops.outcrops.value).toStrictEqual([
      { kind: OutcropKind.Revelation, placeId: 1, stage: OutcropStage.Cleared },
    ]);
  });

  test("a claim without enough resin is refused", () => {
    expect.hasAssertions();

    const { outcrops, wallet } = createOutcrops(0);
    outcrops.openOutcropClaim(1, epoch);

    expect(outcrops.claimPrompt.value).toBeUndefined();
    expect(wallet.value[Currency.Mora]).toBe(EMPTY_WALLET[Currency.Mora]);
  });

  test("a draw stands until the next daily reset, which draws the outcrops again", () => {
    expect.hasAssertions();

    const { outcrops } = createOutcrops();
    outcrops.drawDayOutcrops(epoch.add({ hours: 1 }), () => 0);
    expect(outcrops.outcrops.value).toStrictEqual([
      { kind: OutcropKind.Revelation, placeId: 1, stage: OutcropStage.Cleared },
    ]);

    outcrops.drawDayOutcrops(epoch.add({ hours: 24 }), () => 0);
    expect(outcrops.outcrops.value).toStrictEqual([
      { kind: OutcropKind.Revelation, placeId: 1, stage: OutcropStage.Waiting },
    ]);
  });

  test("a day is not drawn while the region's kinds are not loaded", () => {
    expect.hasAssertions();

    const { outcrops } = createOutcrops();
    outcrops.kindRules.value = [];
    outcrops.drawDayOutcrops(epoch.add({ hours: 24 }), () => 0);
    expect(outcrops.outcrops.value).toStrictEqual([
      { kind: OutcropKind.Revelation, placeId: 1, stage: OutcropStage.Cleared },
    ]);
  });
});
