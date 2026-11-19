import type { Character } from "#src/models/character/Character";
import type { Enemy } from "#src/models/enemy/Enemy";
import type { FriendshipLevels } from "#src/models/friendship/FriendshipLevels";
import type { OutcropKindRule } from "#src/models/leyLine/OutcropKindRule";
import type { OutcropPlacement } from "#src/models/leyLine/OutcropPlacement";
import type { Ref } from "vue";

import { GAME_DATA_LOCAL_BASE_URL } from "#scripts/gameData/constants";
import { useEnemySpawns } from "#src/composables/useEnemySpawns";
import { useWorldOutcrops } from "#src/composables/useWorldOutcrops";
import { CombatTalent } from "#src/models/character/CombatTalent";
import { EnemyState } from "#src/models/enemy/EnemyState";
import { Currency } from "#src/models/inventory/Currency";
import { OutcropKind } from "#src/models/leyLine/OutcropKind";
import { OutcropStage } from "#src/models/leyLine/OutcropStage";
import { BlossomKind } from "#src/models/originalResin/BlossomKind";
import { regionDataSchema } from "#src/models/world/RegionData";
import { readAdventureRankTables } from "#src/services/adventureRank/readAdventureRankTables";
import { readEnemyTables } from "#src/services/enemy/readEnemyTables";
import { EMPTY_INVENTORY, EMPTY_WALLET, MORA_ITEM_ID } from "#src/services/inventory/constants";
import { computeOutcropCampId } from "#src/services/leyLine/computeOutcropCampId";
import { OUTCROP_CAMP_SIZE } from "#src/services/leyLine/constants";
import { readRegionCityIds } from "#src/services/leyLine/readRegionCityIds";
import { BlossomClaimResinMap } from "#src/services/originalResin/BlossomClaimResinMap";
import { BlossomCompanionshipExpMap } from "#src/services/originalResin/BlossomCompanionshipExpMap";
import { ADVENTURE_EXP_PER_RESIN, FRAGILE_RESIN_ITEM_ID } from "#src/services/originalResin/constants";
import { createParty } from "#src/services/party/createParty";
import { startTestAdventureRank } from "#src/store/adventureRank.fixture";
import { startTestWorldFriendship } from "#src/store/friendship.fixture";
import { startTestWorldGround } from "#src/store/ground.fixture";
import { startTestWorldParty } from "#src/store/party.fixture";
import { startTestWorldSession } from "#src/store/session.fixture";
import { useWorldStatuesStore } from "#src/store/statues";
import { jsonDateParse, takeOne, waitForSynchronizedFunctions } from "@esposter/shared";
import { ItemCategory } from "genshin-interface";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { storeToRefs } from "pinia";
import { assert, describe, expect, test } from "vitest";
import { nextTick, ref } from "vue";

const adventureRankTables = await readAdventureRankTables(GAME_DATA_LOCAL_BASE_URL);
const enemyTables = await readEnemyTables(GAME_DATA_LOCAL_BASE_URL);
const regionCityIds = await readRegionCityIds(GAME_DATA_LOCAL_BASE_URL);

// A region's fitted ley line blossom places, as its region data file holds them
const readOutcropPlaces = async (regionId: string): Promise<OutcropPlacement[]> =>
  regionDataSchema.parse(
    jsonDateParse(await readFile(join(import.meta.dirname, "../data/regions", `${regionId}.json`), "utf8")),
  ).outcropPlaces;
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

describe(useWorldOutcrops, () => {
  const CHARACTER_ID = 1;
  const BENCHED_CHARACTER_ID = 2;
  // The World Level a camp spawns under: World Level 8's monster level of 90, less the spawn reference of 18, plus the
  // Camp's level of 1
  const WORLD_LEVEL = 8;
  const SPAWNED_LEVEL = 73;
  const CAMP_ID = "outcrop-1";
  const FRIENDSHIP_LEVELS: FriendshipLevels = [
    { exp: 0, level: 1 },
    { exp: 1000, level: 2 },
  ];
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
  const clearedOutcrop = { kind: OutcropKind.Revelation, placeId: 1, stage: OutcropStage.Cleared };
  // A region no city is named for, so no publish is read for it and its kinds are set by hand
  const FIXTURE_REGION_ID = "fixture";
  // The regions whose blossoms the official map places, each one's kinds read from its own publish
  const NEWLY_FITTED_REGION_IDS = ["liyue", "inazuma", "sumeru"];
  // A region's first resonance, which unlocks its city
  const FIRST_RESONANCE = { claimedLevel: 0, heldCount: 0, level: 1 };

  // A region's outcrops over the world's stores, with a held wallet of resin and the setters writing back. The camps the
  // Outcrops fight spawn into the enemy map the way the world spawns them, at WORLD_LEVEL
  const startOutcrops = (resin: number, placesMap: Ref<Map<string, OutcropPlacement[]>>) => {
    const worldSessionStore = startTestWorldSession(
      { gameDataBaseUrl: GAME_DATA_LOCAL_BASE_URL },
      { inventory: { ...EMPTY_INVENTORY }, wallet: { ...EMPTY_WALLET, [Currency.OriginalResin]: resin } },
    );
    const { events } = worldSessionStore;
    const { inventory, wallet } = storeToRefs(worldSessionStore);
    const { adventureExp } = storeToRefs(startTestAdventureRank(30));
    const startingAdventureExp = adventureExp.value;
    const worldFriendshipStore = startTestWorldFriendship(FRIENDSHIP_LEVELS);
    const { characters } = storeToRefs(
      startTestWorldParty({
        characters: [createCharacter(CHARACTER_ID), createCharacter(BENCHED_CHARACTER_ID)],
        party: createParty([CHARACTER_ID]),
      }),
    );
    startTestWorldGround();
    const enemyMap = new Map<string, Enemy>();
    const outcrops = useWorldOutcrops({ adventureRankTables, enemyMap, placesMap, regionCityIds });
    useEnemySpawns({
      bossDefeatMap: new Map(),
      enemyMap,
      enemyRespawnMap: new Map(),
      enemyTables,
      getWorldNow: () => epoch,
      lastTeleportAts: new Map(),
      onLoad: () => {},
      onRespawn: () => {},
      outcropCamps: outcrops.outcropCamps,
      regionDataMap: new Map(),
      trounceBlossoms: new Map(),
      worldLevel: WORLD_LEVEL,
      worldLevelRows: adventureRankTables.worldLevelRows,
    });
    // A defeat as the combat reports it, which the outcrop and the rest of the world hear
    const defeat = (enemy: Enemy) => {
      enemy.state = EnemyState.Dead;
      events.emit("defeatEnemy", enemy);
    };
    return {
      adventureExp,
      characters,
      defeat,
      enemyMap,
      inventory,
      outcrops,
      placesMap,
      startingAdventureExp,
      wallet,
      worldFriendshipStore,
    };
  };

  // A region's outcrops with its kinds set and the day drawn, so the Revelation waits at the first place. The fixture
  // Region is no city's, so its kinds are set by hand and none is read
  const createOutcrops = (resin = BlossomClaimResinMap[BlossomKind.LeyLine] * 2) => {
    const context = startOutcrops(resin, ref(new Map([[FIXTURE_REGION_ID, PLACEMENTS]])));
    context.outcrops.kindRulesMap.value = new Map([[FIXTURE_REGION_ID, KIND_RULES]]);
    context.outcrops.drawDayOutcrops(epoch, () => 0);
    return context;
  };

  // Touches the Revelation at the first place, then defeats each member of its camp, the last defeat revealing it
  const clearOutcrop = async ({ defeat, enemyMap, outcrops }: ReturnType<typeof createOutcrops>) => {
    outcrops.touchOutcropsNear(0, 0, () => 0);
    await nextTick();
    for (const enemy of enemyMap.values()) defeat(enemy);
  };

  test("each region's kinds are read once the region is entered, not before", async () => {
    expect.hasAssertions();

    const placesMap = ref(new Map<string, OutcropPlacement[]>());
    const { outcrops } = startOutcrops(0, placesMap);
    await waitForSynchronizedFunctions();
    expect(outcrops.kindRulesMap.value.size).toBe(0);

    placesMap.value = new Map([["mondstadt", await readOutcropPlaces("mondstadt")]]);
    await nextTick();
    await waitForSynchronizedFunctions();
    expect(outcrops.kindRulesMap.value.get("mondstadt")?.map(({ kind }) => kind)).toStrictEqual([
      OutcropKind.Wealth,
      OutcropKind.Revelation,
    ]);
  });

  test("touching an outcrop spawns its enemies", async () => {
    expect.hasAssertions();

    const { enemyMap, outcrops } = createOutcrops();
    outcrops.touchOutcropsNear(0, 0, () => 0);
    await nextTick();

    expect(Array.from(enemyMap.values(), ({ campId, level }) => ({ campId, level }))).toStrictEqual(
      Array.from({ length: OUTCROP_CAMP_SIZE }, () => ({ campId: CAMP_ID, level: SPAWNED_LEVEL })),
    );
  });

  test.each(NEWLY_FITTED_REGION_IDS)("touching an outcrop spawns its enemies in %s", async (regionId) => {
    expect.hasAssertions();

    const places = await readOutcropPlaces(regionId);
    const placesMap = ref(new Map<string, OutcropPlacement[]>());
    const { enemyMap, outcrops } = startOutcrops(0, placesMap);
    const worldStatuesStore = useWorldStatuesStore();
    const { regionStatueProgressMap } = storeToRefs(worldStatuesStore);
    regionStatueProgressMap.value = new Map([[regionId, FIRST_RESONANCE]]);
    placesMap.value = new Map([[regionId, places]]);
    await nextTick();
    await waitForSynchronizedFunctions();
    outcrops.drawDayOutcrops(epoch, () => 0);
    const outcrop = takeOne(outcrops.outcrops.value, 0);
    const place = places.find(({ id }) => id === outcrop.placeId);
    assert.exists(place);
    outcrops.touchOutcropsNear(place.position.x, place.position.z, () => 0);
    await nextTick();

    expect(Array.from(enemyMap.values(), ({ campId, level }) => ({ campId, level }))).toStrictEqual(
      Array.from({ length: OUTCROP_CAMP_SIZE }, () => ({
        campId: computeOutcropCampId(outcrop.placeId),
        level: SPAWNED_LEVEL,
      })),
    );
  });

  test("defeating the last enemy reveals the blossom", async () => {
    expect.hasAssertions();

    const { defeat, enemyMap, outcrops } = createOutcrops();
    outcrops.touchOutcropsNear(0, 0, () => 0);
    await nextTick();
    const enemies = [...enemyMap.values()];
    defeat(takeOne(enemies, 0));
    defeat(takeOne(enemies, 1));

    expect(outcrops.outcrops.value).toStrictEqual([
      { kind: OutcropKind.Revelation, placeId: 1, stage: OutcropStage.Fighting },
    ]);
    expect(outcrops.outcropInteractables.value).toStrictEqual([]);
    defeat(takeOne(enemies, 2));
    expect(outcrops.outcropInteractables.value.map(({ id }) => id)).toStrictEqual(["1"]);
  });

  test("pressing F at a cleared challenge's blossom offers its claims", async () => {
    expect.hasAssertions();

    const context = createOutcrops();
    await clearOutcrop(context);
    context.outcrops.openOutcropClaim(1, epoch);
    expect(context.outcrops.claimPrompt.value?.offers.length).toBeGreaterThan(0);
  });

  test("choosing an offer spends its resin and grants its rewards", async () => {
    expect.hasAssertions();

    const context = createOutcrops();
    await clearOutcrop(context);
    const { adventureExp, outcrops, startingAdventureExp, wallet } = context;
    outcrops.openOutcropClaim(1, epoch);
    assert.exists(outcrops.claimPrompt.value);
    outcrops.chooseOutcropClaim(takeOne(outcrops.claimPrompt.value.offers, 0), epoch, 0, () => 0);

    expect(wallet.value[Currency.OriginalResin]).toBe(BlossomClaimResinMap[BlossomKind.LeyLine]);
    expect(wallet.value[Currency.Mora]).toBe(EMPTY_WALLET[Currency.Mora] + 100);
    expect(adventureExp.value - startingAdventureExp).toBe(
      ADVENTURE_EXP_PER_RESIN * BlossomClaimResinMap[BlossomKind.LeyLine],
    );
    expect(outcrops.outcrops.value).toStrictEqual([
      { kind: OutcropKind.Revelation, placeId: 2, stage: OutcropStage.Waiting },
    ]);
  });

  test("a claim gives each deployed character the claim's Companionship EXP, and a benched one none", async () => {
    expect.hasAssertions();

    const context = createOutcrops();
    await clearOutcrop(context);
    const { characters, outcrops } = context;
    outcrops.openOutcropClaim(1, epoch);
    assert.exists(outcrops.claimPrompt.value);
    const offer = takeOne(outcrops.claimPrompt.value.offers, 0);
    outcrops.chooseOutcropClaim(offer, epoch, 0, () => 0);

    expect(characters.value.map(({ friendshipExp, id }) => ({ friendshipExp, id }))).toStrictEqual([
      { friendshipExp: BlossomCompanionshipExpMap[BlossomKind.LeyLine] * offer.claimCount, id: CHARACTER_ID },
      { friendshipExp: 0, id: BENCHED_CHARACTER_ID },
    ]);
  });

  test("a claim waits until the friendship levels are loaded, and keeps its prompt and its resin", async () => {
    expect.hasAssertions();

    const context = createOutcrops();
    await clearOutcrop(context);
    const { characters, outcrops, wallet, worldFriendshipStore } = context;
    worldFriendshipStore.friendshipLevels = undefined;
    outcrops.openOutcropClaim(1, epoch);
    assert.exists(outcrops.claimPrompt.value);
    outcrops.chooseOutcropClaim(takeOne(outcrops.claimPrompt.value.offers, 0), epoch, 0, () => 0);

    expect(outcrops.claimPrompt.value).toBeDefined();
    expect(wallet.value[Currency.OriginalResin]).toBe(BlossomClaimResinMap[BlossomKind.LeyLine] * 2);
    expect(characters.value.map(({ friendshipExp }) => friendshipExp)).toStrictEqual([0, 0]);
  });

  test("a short original resin restores with a fragile resin, and the claims are offered again", async () => {
    expect.hasAssertions();

    const context = createOutcrops(0);
    const { inventory, outcrops } = context;
    inventory.value = {
      items: [
        {
          definition: {
            category: ItemCategory.Material,
            id: FRAGILE_RESIN_ITEM_ID,
            name: "",
            rank: 0,
            rarity: 0,
            stackLimit: 2000,
          },
          id: 1,
          quantity: 1,
        },
      ],
      nextId: 2,
      quickSwapItemIds: [],
    };
    await clearOutcrop(context);
    outcrops.openOutcropClaim(1, epoch);
    expect(outcrops.claimPrompt.value?.canRestore).toBe(true);

    outcrops.restoreOutcropClaim(epoch);
    expect(inventory.value.items).toStrictEqual([]);
    expect(outcrops.claimPrompt.value?.canRestore).toBe(false);
    expect(outcrops.claimPrompt.value?.offers.length).toBeGreaterThan(0);
  });

  test("a cleared challenge never claimed gives nothing", async () => {
    expect.hasAssertions();

    const context = createOutcrops();
    await clearOutcrop(context);
    const { outcrops, wallet } = context;
    outcrops.openOutcropClaim(1, epoch);
    outcrops.closeOutcropClaim();

    expect(outcrops.claimPrompt.value).toBeUndefined();
    expect(wallet.value[Currency.Mora]).toBe(EMPTY_WALLET[Currency.Mora]);
    expect(outcrops.outcrops.value).toStrictEqual([clearedOutcrop]);
  });

  test("a claim without enough resin is refused", async () => {
    expect.hasAssertions();

    const context = createOutcrops(0);
    await clearOutcrop(context);
    const { outcrops, wallet } = context;
    expect(outcrops.outcrops.value).toStrictEqual([clearedOutcrop]);
    outcrops.openOutcropClaim(1, epoch);

    expect(outcrops.claimPrompt.value).toBeUndefined();
    expect(wallet.value[Currency.Mora]).toBe(EMPTY_WALLET[Currency.Mora]);
  });

  test("a draw stands until the next daily reset, which draws the outcrops again", async () => {
    expect.hasAssertions();

    const context = createOutcrops();
    await clearOutcrop(context);
    const { outcrops } = context;
    outcrops.drawDayOutcrops(epoch.add({ hours: 1 }), () => 0);
    expect(outcrops.outcrops.value).toStrictEqual([clearedOutcrop]);

    outcrops.drawDayOutcrops(epoch.add({ hours: 24 }), () => 0);
    expect(outcrops.outcrops.value).toStrictEqual([
      { kind: OutcropKind.Revelation, placeId: 1, stage: OutcropStage.Waiting },
    ]);
  });

  test("a day is not drawn while the region's kinds are not loaded", async () => {
    expect.hasAssertions();

    const context = createOutcrops();
    await clearOutcrop(context);
    const { outcrops } = context;
    outcrops.kindRulesMap.value = new Map();
    outcrops.drawDayOutcrops(epoch.add({ hours: 24 }), () => 0);
    expect(outcrops.outcrops.value).toStrictEqual([clearedOutcrop]);
  });

  test("a region holding only found Oculi does not unlock its city's kinds", () => {
    expect.hasAssertions();

    const { outcrops } = startOutcrops(0, ref(new Map([[FIXTURE_REGION_ID, PLACEMENTS]])));
    const kindRules: OutcropKindRule[] = [
      {
        kind: OutcropKind.Revelation,
        playerLevel: 1,
        unlockCityIds: [3],
        worldLevelRewards: [[{ itemId: MORA_ITEM_ID, maxCount: 100, minCount: 100 }]],
      },
    ];
    outcrops.kindRulesMap.value = new Map([[FIXTURE_REGION_ID, kindRules]]);
    const worldStatuesStore = useWorldStatuesStore();
    const { regionStatueProgressMap } = storeToRefs(worldStatuesStore);
    // Inazuma is the city 3, and an Oculus found there before its statue is resonated leaves its level at none
    regionStatueProgressMap.value = new Map([["inazuma", { claimedLevel: 0, heldCount: 1, level: 0 }]]);
    outcrops.drawDayOutcrops(epoch, () => 0);
    expect(outcrops.outcrops.value).toStrictEqual([]);

    regionStatueProgressMap.value = new Map([["inazuma", FIRST_RESONANCE]]);
    outcrops.drawDayOutcrops(epoch.add({ hours: 24 }), () => 0);
    expect(outcrops.outcrops.value).toStrictEqual([
      { kind: OutcropKind.Revelation, placeId: 1, stage: OutcropStage.Waiting },
    ]);
  });

  test("a claim moves the outcrop to the nearest other place of its own region", async () => {
    expect.hasAssertions();

    // The other region's place stands nearer the claimed one than the fixture region's second place does, and holds no kind
    const context = createOutcrops();
    context.placesMap.value = new Map([
      ["other", [{ id: 3, position: { x: 10, z: 0 } }]],
      [FIXTURE_REGION_ID, PLACEMENTS],
    ]);
    await clearOutcrop(context);
    const { outcrops } = context;
    outcrops.openOutcropClaim(1, epoch);
    assert.exists(outcrops.claimPrompt.value);
    outcrops.chooseOutcropClaim(takeOne(outcrops.claimPrompt.value.offers, 0), epoch, 0, () => 0);

    expect(outcrops.outcrops.value).toStrictEqual([
      { kind: OutcropKind.Revelation, placeId: 2, stage: OutcropStage.Waiting },
    ]);
  });
});
