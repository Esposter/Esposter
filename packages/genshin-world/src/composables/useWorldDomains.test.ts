import type { Enemy } from "#src/models/enemy/Enemy";
import type { Inventory } from "#src/models/inventory/Inventory";
import type { Wallet } from "#src/models/inventory/Wallet";
import type { DomainEntranceLandmark } from "#src/models/world/DomainEntranceLandmark";
import type { Landmark } from "#src/models/world/Landmark";
import type { readWeeklyBossDomains } from "#src/services/domains/readWeeklyBossDomains";

import { useWorldDomains } from "#src/composables/useWorldDomains";
import { DomainKind } from "#src/models/domains/DomainKind";
import { EnemyKindId } from "#src/models/enemy/EnemyKindId";
import { EnemyState } from "#src/models/enemy/EnemyState";
import { LandmarkKind } from "#src/models/world/LandmarkKind";
import { createElementalState } from "#src/services/combat/aura/createElementalState";
import { EMPTY_WALLET } from "#src/services/inventory/constants";
import { createWorldEvents } from "#src/services/world/createWorldEvents";
import { GameTextKey } from "genshin-text";
import { describe, expect, test, vi } from "vitest";
import { ref, shallowRef } from "vue";

vi.mock(import("#src/services/domains/readWeeklyBossDomains"), () => ({
  readWeeklyBossDomains: vi.fn<typeof readWeeklyBossDomains>(() =>
    Promise.resolve({ "1006": { levels: [{ dungeonId: 1, enemyLevel: 1, recommendedRank: 40 }] } }),
  ),
}));

// A weekly boss's trounce entrance, with the made-up placement a test needs and the production entry id
const domainEntrance: DomainEntranceLandmark = {
  areaId: "mondstadt",
  arrival: { heightOffset: 0, position: { x: 600, z: 0 }, rotation: 0 },
  domainKind: DomainKind.Trounce,
  entryId: 1006,
  heightOffset: 0,
  id: "weekly-boss-domain-entrance",
  kind: LandmarkKind.DomainEntrance,
  position: { x: 600, z: 0 },
  rotation: 0,
  titleTextKey: GameTextKey.DomainEntrance24,
};

// A boss in the arena's camp, staggered by its shield's break, with every other field made up
const createBrokenBoss = (campId: string): Enemy => ({
  attackCooldownSeconds: 0,
  campId,
  droppedThresholdCount: 0,
  elementalReactions: [],
  elementalState: createElementalState(),
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
});

const createDomains = () => {
  const events = createWorldEvents();
  const domains = useWorldDomains({
    adventureExp: ref(0),
    adventureRankTables: { levels: [], locks: [], worldLevelRows: [] },
    clearedDomainIds: shallowRef(new Set<string>()),
    completedMainQuestIds: shallowRef(new Set<string>()),
    events,
    gameDataBaseUrl: "",
    getWorldNow: () => Temporal.Instant.fromEpochMilliseconds(0),
    inventory: ref<Inventory>({ items: [], nextId: 0, quickSwapItemIds: [] }),
    jumpTo: vi.fn<() => void>(),
    materialDataMap: new Map(),
    nameText: {},
    random: () => 0.5,
    rank: ref(40),
    setInventory: vi.fn<() => void>(),
    setWallet: vi.fn<() => void>(),
    unlockedLandmarks: ref<Landmark[]>([domainEntrance]),
    wallet: ref<Wallet>(EMPTY_WALLET),
  });
  return { domains, events };
};

describe("stepDomainChallenge", () => {
  test("a broken shield moves Stormterror's fight on, and each phase's transition attack is returned as it ends", async () => {
    expect.hasAssertions();

    const { domains, events } = createDomains();
    // The quick challenge reads the weekly schedule, then enters the tier the rank of 40 reaches and starts the fight there
    await expect(domains.quickChallengeDomain(domainEntrance, 40, true)).resolves.toBe(true);
    const campId = domains.domainCamps.value[0]?.id ?? "";
    const step = () => domains.stepDomainChallenge({ deltaMilliseconds: 1000, isPlaying: true, partyDown: false });

    expect(step()).toStrictEqual([]);
    events.emit("shieldBreak", createBrokenBoss(campId));
    // Phase 1 allows one shield break, so the first break ends it and its transition attack starts
    expect(step()).toStrictEqual(["Caelestinum Finale Termini"]);
    // Phase 2 allows three breaks in total, so the second break is the second of the three and moves nothing
    events.emit("shieldBreak", createBrokenBoss(campId));
    expect(step()).toStrictEqual([]);
    events.emit("shieldBreak", createBrokenBoss(campId));
    expect(step()).toStrictEqual(["Caelestinum Finale Termini"]);
  });
});
