import type { CommissionSlice } from "#src/models/commission/CommissionSlice";
import type { Quest } from "#src/models/quest/Quest";
import type { QuestProgress } from "#src/models/quest/QuestProgress";
import type { WorldEvents } from "#src/models/world/WorldEvents";

import { useWorldCommissions } from "#src/composables/useWorldCommissions";
import { CommissionFinishKind } from "#src/models/commission/CommissionFinishKind";
import { CommissionKind } from "#src/models/commission/CommissionKind";
import { QuestKind } from "#src/models/quest/QuestKind";
import { QuestObjectiveKind } from "#src/models/quest/QuestObjectiveKind";
import { LONG_TERM_MAJOR_VERSION } from "#src/services/commission/constants";
import { readCommissionSlices } from "#src/services/commission/readCommissionSlices";
import { GAME_DAY_START_HOUR } from "#src/services/time/constants";
import { createWorldEvents } from "#src/services/world/createWorldEvents";
import { describe, expect, test, vi } from "vitest";
import { computed, shallowRef } from "vue";

vi.mock(import("#src/services/commission/readCommissionSlices"));

// The load runs in the background, so it settles on the next turn of the event loop
const waitForReads = () =>
  new Promise((resolve) => {
    setTimeout(resolve, 0);
  });

const RANK = 12;
const createSlice = (): CommissionSlice => ({
  bonuses: [],
  rewardTiers: [],
  tasks: [2, 3, 4, 5].map((id) => ({
    centerPosition: `Event_${id}`,
    enterDistance: 40,
    exitDistance: 60,
    finishKind: CommissionFinishKind.Monster,
    finishProgress: 8,
    id,
    kind: CommissionKind.Scene,
    nameTextId: String(id),
    newGroupIds: [],
    oldGroupIds: [],
    poolId: 3001,
    preferredRegion: "liyue",
    questId: "",
    rewardTier: 2,
  })),
});

// The commissions composable as a load of the save reads it an hour past the daily reset, with no Encounter Points held
const useAfterReset = (events: WorldEvents) => {
  const todayReset = Temporal.Instant.fromEpochMilliseconds(0).subtract({ hours: GAME_DAY_START_HOUR });
  return useWorldCommissions({
    events,
    finishedMainQuestIds: computed(() => new Set<number>()),
    gameDataBaseUrl: "",
    getWorldNow: () => todayReset.add({ hours: 1 }),
    questProgressMap: shallowRef(new Map<string, QuestProgress>()),
    questsInProgress: computed<Quest[]>(() => []),
    rank: computed(() => RANK),
    savedCommissionDay: { claimedCommissionIds: [], dealtAt: todayReset, dealtCommissions: [] },
    savedEncounterPoints: { earnedOn: todayReset, halfPoints: 0 },
    savedLongTermEncounterPoints: { halfPoints: 0, majorVersion: LONG_TERM_MAJOR_VERSION },
  });
};

// The four unfinished commissions of a kept day, with one whole Encounter Point held, read as the world opens at the given rank
const useUnfinishedDay = (rank: number) => {
  const todayReset = Temporal.Instant.fromEpochMilliseconds(0).subtract({ hours: GAME_DAY_START_HOUR });
  vi.mocked(readCommissionSlices).mockResolvedValue([createSlice()]);
  return useWorldCommissions({
    events: createWorldEvents(),
    finishedMainQuestIds: computed(() => new Set<number>()),
    gameDataBaseUrl: "",
    getWorldNow: () => todayReset.add({ hours: 1 }),
    questProgressMap: shallowRef(new Map<string, QuestProgress>()),
    questsInProgress: computed<Quest[]>(() => []),
    rank: computed(() => rank),
    savedCommissionDay: {
      claimedCommissionIds: [],
      dealtAt: todayReset,
      dealtCommissions: [2, 3, 4, 5].map((commissionId) => ({ commissionId, count: 0, dealtRank: RANK })),
    },
    savedEncounterPoints: { earnedOn: todayReset, halfPoints: 2 },
    savedLongTermEncounterPoints: { halfPoints: 0, majorVersion: LONG_TERM_MAJOR_VERSION },
  });
};

describe(useWorldCommissions, () => {
  test("a day dealt before the daily reset is dealt again", async () => {
    expect.hasAssertions();
    // The epoch is eight in the morning in the server's zone, four hours past that day's 04:00 reset, whatever the reader's zone
    const todayReset = Temporal.Instant.fromEpochMilliseconds(0).subtract({ hours: GAME_DAY_START_HOUR });
    const now = todayReset.add({ hours: 1 });
    vi.mocked(readCommissionSlices).mockResolvedValue([createSlice()]);
    const { commissionDay } = useWorldCommissions({
      events: createWorldEvents(),
      finishedMainQuestIds: computed(() => new Set<number>()),
      gameDataBaseUrl: "",
      getWorldNow: () => now,
      questProgressMap: shallowRef(new Map<string, QuestProgress>()),
      questsInProgress: computed<Quest[]>(() => []),
      rank: computed(() => RANK),
      savedCommissionDay: {
        claimedCommissionIds: [1],
        dealtAt: todayReset.subtract({ minutes: 1 }),
        dealtCommissions: [{ commissionId: 1, count: 3, dealtRank: RANK }],
      },
    });
    await waitForReads();
    expect(commissionDay.value.dealtCommissions).toHaveLength(4);
    expect(commissionDay.value.claimedCommissionIds).toStrictEqual([]);
    expect(commissionDay.value.dealtAt.toString()).toBe(now.toString());
  });

  test("a finished Archon quest earns four Encounter Points, and a World quest earns none", () => {
    expect.hasAssertions();
    const events = createWorldEvents();
    const todayReset = Temporal.Instant.fromEpochMilliseconds(0).subtract({ hours: GAME_DAY_START_HOUR });
    const { encounterPoints } = useWorldCommissions({
      events,
      finishedMainQuestIds: computed(() => new Set<number>()),
      gameDataBaseUrl: "",
      getWorldNow: () => todayReset.add({ hours: 1 }),
      questProgressMap: shallowRef(new Map<string, QuestProgress>()),
      questsInProgress: computed<Quest[]>(() => []),
      rank: computed(() => RANK),
      savedCommissionDay: { claimedCommissionIds: [], dealtAt: todayReset, dealtCommissions: [] },
      savedEncounterPoints: { earnedOn: todayReset, halfPoints: 0 },
      savedLongTermEncounterPoints: { halfPoints: 0, majorVersion: LONG_TERM_MAJOR_VERSION },
    });
    events.emit(
      "finishQuest",
      { id: "archon", kind: QuestKind.World } as Quest,
      {} as QuestProgress,
      {} as QuestProgress,
    );
    expect(encounterPoints.value.halfPoints).toBe(0);
    events.emit(
      "finishQuest",
      { id: "archon", kind: QuestKind.Archon } as Quest,
      {} as QuestProgress,
      {} as QuestProgress,
    );
    expect(encounterPoints.value.halfPoints).toBe(8);
  });

  test("a finished Archon quest past the storage keeps the overflow as Long-Term Encounter Points", () => {
    expect.hasAssertions();
    const events = createWorldEvents();
    const todayReset = Temporal.Instant.fromEpochMilliseconds(0).subtract({ hours: GAME_DAY_START_HOUR });
    const { longTermEncounterPoints } = useWorldCommissions({
      events,
      finishedMainQuestIds: computed(() => new Set<number>()),
      gameDataBaseUrl: "",
      getWorldNow: () => todayReset.add({ hours: 1 }),
      questProgressMap: shallowRef(new Map<string, QuestProgress>()),
      questsInProgress: computed<Quest[]>(() => []),
      rank: computed(() => RANK),
      savedCommissionDay: { claimedCommissionIds: [], dealtAt: todayReset, dealtCommissions: [] },
      savedEncounterPoints: { earnedOn: todayReset, halfPoints: 4 },
      savedLongTermEncounterPoints: { halfPoints: 0, majorVersion: LONG_TERM_MAJOR_VERSION },
    });
    events.emit(
      "finishQuest",
      { id: "archon", kind: QuestKind.Archon } as Quest,
      {} as QuestProgress,
      {} as QuestProgress,
    );
    expect(longTermEncounterPoints.value).toStrictEqual({ halfPoints: 4, majorVersion: LONG_TERM_MAJOR_VERSION });
  });

  test("a collected item the wiki lists earns a half point, and an item it does not list earns none", () => {
    expect.hasAssertions();
    const events = createWorldEvents();
    const { encounterPoints } = useAfterReset(events);
    events.emit("gatheringPickedUp", "107010");
    expect(encounterPoints.value.halfPoints).toBe(1);
    events.emit("gatheringPickedUp", "107033");
    expect(encounterPoints.value.halfPoints).toBe(1);
  });

  test("a Crimson Agate held by a chest earns nothing, as a chest raises only the quest event", () => {
    expect.hasAssertions();
    const events = createWorldEvents();
    const { encounterPoints } = useAfterReset(events);
    events.emit("questEvent", { kind: QuestObjectiveKind.Collect, targetId: "107010" });
    expect(encounterPoints.value.halfPoints).toBe(0);
  });

  test("an Oculus found the first time earns a half point", () => {
    expect.hasAssertions();
    const events = createWorldEvents();
    const { encounterPoints } = useAfterReset(events);
    events.emit("oculusFound");
    expect(encounterPoints.value.halfPoints).toBe(1);
  });

  test("the Commissions tab offers no point claim below Adventure Rank 24", async () => {
    expect.hasAssertions();
    const { handbookDayCommissions, isAdventureEncountersUnlocked } = useUnfinishedDay(23);
    await waitForReads();
    expect(isAdventureEncountersUnlocked.value).toBe(false);
    expect(handbookDayCommissions.value.map(({ isClaimable }) => isClaimable)).toStrictEqual([
      false,
      false,
      false,
      false,
    ]);
  });

  test("the Commissions tab offers a point claim at Adventure Rank 24", async () => {
    expect.hasAssertions();
    const { handbookDayCommissions, isAdventureEncountersUnlocked } = useUnfinishedDay(24);
    await waitForReads();
    expect(isAdventureEncountersUnlocked.value).toBe(true);
    expect(handbookDayCommissions.value.map(({ isClaimable }) => isClaimable)).toStrictEqual([true, true, true, true]);
  });
});
