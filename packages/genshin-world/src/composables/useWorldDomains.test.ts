import type { DomainChallengeLevelMap } from "#src/models/domains/DomainChallengeLevelMap";
import type { DomainSchedule } from "#src/models/domains/DomainSchedule";
import type { Enemy } from "#src/models/enemy/Enemy";
import type { Inventory } from "#src/models/inventory/Inventory";
import type { Wallet } from "#src/models/inventory/Wallet";
import type { DomainEntranceLandmark } from "#src/models/world/DomainEntranceLandmark";
import type { Landmark } from "#src/models/world/Landmark";
import type { WorldJumpPose } from "#src/models/world/WorldJumpPose";
import type { readWeeklyBossDomains } from "#src/services/domains/readWeeklyBossDomains";

import { useWorldDomains } from "#src/composables/useWorldDomains";
import { DomainKind } from "#src/models/domains/DomainKind";
import { DomainLevelState } from "#src/models/domains/DomainLevelState";
import { EnemyFamily } from "#src/models/enemy/EnemyFamily";
import { EnemyKindId } from "#src/models/enemy/EnemyKindId";
import { EnemyState } from "#src/models/enemy/EnemyState";
import { PoiseType } from "#src/models/enemy/PoiseType";
import { LandmarkKind } from "#src/models/world/LandmarkKind";
import { STORMTERROR_FINALE_ATTACK } from "#src/services/bosses/stormterror";
import { TRAVELER_CHARACTER_ID } from "#src/services/character/constants";
import { createElementalState } from "#src/services/combat/aura/createElementalState";
import { readGameDataEntry } from "#src/services/data/readGameDataEntry";
import { computeDomainScenePose } from "#src/services/domains/computeDomainScenePose";
import { EMPTY_WALLET } from "#src/services/inventory/constants";
import { computeJumpPose } from "#src/services/map/computeJumpPose";
import { createParty } from "#src/services/party/createParty";
import { flushReads } from "#src/services/shared/flushReads.test";
import { createWorldClock } from "#src/services/time/createWorldClock.test";
import { createWorldEvents } from "#src/services/world/createWorldEvents";
import { GameTextKey } from "genshin-text";
import { describe, expect, test, vi } from "vitest";
import { ref, shallowRef } from "vue";

vi.mock(import("#src/services/data/readGameDataEntry"));
vi.mock(import("#src/services/domains/readWeeklyBossDomains"), () => ({
  readWeeklyBossDomains: vi.fn<typeof readWeeklyBossDomains>(() =>
    Promise.resolve({ "1006": { levels: [{ dungeonId: 1, enemyLevel: 1, recommendedRank: 40 }] } }),
  ),
}));

// A weekly boss's trounce entrance, with the made-up placement a test needs and the production entry id
const createDomainEntrance = (): DomainEntranceLandmark => ({
  areaId: "mondstadt",
  arrival: { heightOffset: 1, position: { x: 600, z: 0 }, rotation: 0 },
  domainKind: DomainKind.Trounce,
  entryId: 1006,
  heightOffset: 1,
  id: "weekly-boss-domain-entrance",
  kind: LandmarkKind.DomainEntrance,
  position: { x: 600, z: 0 },
  rotation: 0,
  titleTextKey: GameTextKey.DomainEntrance24,
});

// A boss in the arena's camp, staggered by its shield's break, with every other field made up
const createBrokenBoss = (campId: string): Enemy => ({
  attackCooldownSeconds: 0,
  campId,
  droppedThresholdCount: 0,
  elementalNodePulsesLeft: 0,
  elementalReactions: [],
  elementalState: createElementalState(),
  enemyFamily: EnemyFamily.EnemiesOfNote,
  enemyKindId: EnemyKindId.StormterrorDvalin,
  heading: 0,
  health: 1,
  hitSeconds: Infinity,
  home: { x: 0, z: 0 },
  id: "boss",
  internalCooldownMap: new Map(),
  level: 1,
  maxHealth: 1,
  moondriftHarmonyHits: [],
  moveIndex: 0,
  patrol: [],
  patrolIndex: 0,
  poise: 0,
  poiseBrokenSeconds: 0,
  position: { x: 0, z: 0 },
  state: EnemyState.Stagger,
  stateSeconds: 0,
  statuses: [],
  traits: { energyDrops: [], poiseType: PoiseType.Boss },
});

const createDomains = (clock = createWorldClock(Temporal.Instant.fromEpochMilliseconds(0))) => {
  // The challenge levels the tests enter, made up with the one enemy each fight needs: the weekly boss's at rank 40,
  // And the Domain of Forgery's at rank 15 that the day tests open
  const domainChallengeLevels: DomainChallengeLevelMap = {
    "2": {
      "15": {
        defeatTarget: 1,
        timeLimitSeconds: Number.POSITIVE_INFINITY,
        waves: [[{ count: 1, enemyKindId: EnemyKindId.StormterrorDvalin, name: "Stormterror Dvalin" }]],
      },
    },
    "1006": {
      "40": {
        defeatTarget: 1,
        timeLimitSeconds: Number.POSITIVE_INFINITY,
        waves: [[{ count: 1, enemyKindId: EnemyKindId.StormterrorDvalin, name: "Stormterror Dvalin" }]],
      },
    },
  };
  const events = createWorldEvents();
  const jumpTo = vi.fn<(pose: WorldJumpPose) => void>();
  const domains = useWorldDomains({
    adventureExp: ref(0),
    adventureRankTables: { levels: [], locks: [], worldLevelRows: [] },
    artifactMainAffixPools: [],
    artifactRarityDataMap: new Map(),
    clearedDomainIds: shallowRef(new Set<string>()),
    completedMainQuestIds: shallowRef(new Set<string>()),
    domainChallengeLevels,
    events,
    gameDataBaseUrl: "",
    getWorldNow: clock.getWorldNow,
    inventory: ref<Inventory>({ items: [], nextId: 0, quickSwapItemIds: [] }),
    jumpTo,
    kitEffectState: { effects: [] },
    materialDataMap: new Map(),
    nameText: {},
    party: createParty([TRAVELER_CHARACTER_ID]),
    random: () => 0.5,
    rank: ref(40),
    reliquaryPieceEntryMap: new Map(),
    reliquarySets: [],
    setInventory: vi.fn<() => void>(),
    setWallet: vi.fn<() => void>(),
    unlockedLandmarks: ref<Landmark[]>([createDomainEntrance()]),
    wallet: ref<Wallet>(EMPTY_WALLET),
    weaponDataMap: new Map(),
    worldNow: clock.worldNow,
  });
  return { domains, events, jumpTo };
};

describe(useWorldDomains, () => {
  const domainEntrance = createDomainEntrance();
  // A Domain of Forgery open on Mondays, and on Sundays like every one
  const forgeryEntrance: DomainEntranceLandmark = { ...domainEntrance, domainKind: DomainKind.Forgery, entryId: 2 };
  const forgerySchedule: DomainSchedule = {
    artifactSetIds: [],
    kind: DomainKind.Forgery,
    levels: [
      {
        disorder: "",
        dungeonId: 1,
        enemyLevel: 1,
        recommendedRank: 15,
        resinCost: 0,
        scheduledDaysOfWeek: [1],
        treeArtifacts: [],
        treeRewards: [],
      },
    ],
  };
  // The epoch falls on a Thursday on the server's clock, so the fifth day on is a Monday and the sixth a Tuesday
  const monday = Temporal.Instant.fromEpochMilliseconds(0).add({ hours: 4 * 24 });
  const tuesday = monday.add({ hours: 24 });
  const openForgery = async (clock: ReturnType<typeof createWorldClock>) => {
    vi.mocked(readGameDataEntry).mockResolvedValue(forgerySchedule);
    const { domains } = createDomains(clock);
    domains.openDomain(forgeryEntrance);
    await flushReads();
    return domains;
  };

  test("a broken shield moves Stormterror's fight on, and each phase's transition attack is returned as it ends", async () => {
    expect.hasAssertions();

    const { domains, events } = createDomains();
    // The quick challenge reads the weekly schedule, then enters the tier the rank of 40 reaches and starts
    // The fight there
    await expect(domains.quickChallengeDomain(domainEntrance, 40, true)).resolves.toBe(true);
    const campId = domains.domainCamps.value[0]?.id || "";
    const step = () => domains.stepDomainChallenge({ deltaMilliseconds: 1000, isPartyDown: false, isPlaying: true });

    expect(step()).toStrictEqual([]);
    events.emit("shieldBreak", createBrokenBoss(campId));
    // Phase 1 allows one shield break, so the first break ends it and its transition attack starts
    expect(step()).toStrictEqual([STORMTERROR_FINALE_ATTACK]);
    // Phase 2 allows three breaks in total, so the second break is the second of the three and moves nothing
    events.emit("shieldBreak", createBrokenBoss(campId));
    expect(step()).toStrictEqual([]);
    events.emit("shieldBreak", createBrokenBoss(campId));
    expect(step()).toStrictEqual([STORMTERROR_FINALE_ATTACK]);
  });

  test("entering a domain fades into its scene", async () => {
    expect.hasAssertions();

    const { domains, jumpTo } = createDomains();
    await expect(domains.quickChallengeDomain(domainEntrance, 40, true)).resolves.toBe(true);
    expect(jumpTo).toHaveBeenCalledExactlyOnceWith(computeDomainScenePose(domainEntrance.arrival));
  });

  test("leaving a domain fades back to its entrance", async () => {
    expect.hasAssertions();

    const { domains, jumpTo } = createDomains();
    await domains.quickChallengeDomain(domainEntrance, 40, true);
    domains.leaveDomain();
    expect(domains.domainArena.value).toBeUndefined();
    expect(jumpTo).toHaveBeenLastCalledWith(computeJumpPose(domainEntrance));
  });

  test("its row closes when the game day turns on a day it is not open", async () => {
    expect.hasAssertions();

    const clock = createWorldClock(monday);
    const domains = await openForgery(clock);
    expect(domains.domainLevelRows.value.map(({ state }) => state)).toStrictEqual([DomainLevelState.Open]);
    clock.moveTo(tuesday);
    expect(domains.domainLevelRows.value.map(({ state }) => state)).toStrictEqual([DomainLevelState.Closed]);
  });

  test("a level is entered on a day it is open, and not once the game day has turned", async () => {
    expect.hasAssertions();

    const clock = createWorldClock(monday);
    const domains = await openForgery(clock);
    clock.moveTo(tuesday);
    domains.enterDomain(1);
    expect(domains.domainArena.value).toBeUndefined();
    clock.moveTo(monday);
    domains.enterDomain(1);
    expect(domains.domainArena.value).toBeDefined();
  });
});
