import type { CommissionSlice } from "#src/models/commission/CommissionSlice";
import type { EncounterPoints } from "#src/models/commission/EncounterPoints";
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
import { flushReads } from "#src/services/shared/flushReads.test";
import { GAME_DAY_START_HOUR } from "#src/services/time/constants";
import { createWorldClock } from "#src/services/time/createWorldClock.test";
import { createWorldEvents } from "#src/services/world/createWorldEvents";
import { describe, expect, test, vi } from "vitest";
import { computed } from "vue";

vi.mock(import("#src/services/commission/readCommissionSlices"));

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

describe(useWorldCommissions, () => {
  const RANK = 12;

  // The epoch is eight in the morning in the server's zone, four hours past that day's 04:00 reset, whatever the reader's zone
  const todayReset = Temporal.Instant.fromEpochMilliseconds(0).subtract({ hours: GAME_DAY_START_HOUR });
  const afterReset = todayReset.add({ hours: 1 });
  const nextReset = todayReset.add({ hours: 24 });
  const baseCommissions = {
    finishedMainQuestIds: computed(() => new Set<number>()),
    gameDataBaseUrl: "",
    questTargetIds: computed<string[]>(() => []),
    rank: computed(() => RANK),
    savedLongTermEncounterPoints: { halfPoints: 0, majorVersion: LONG_TERM_MAJOR_VERSION },
  };

  // The commissions composable as a load of the save reads it an hour past the daily reset, holding the given Encounter Points
  const useAfterReset = (
    events: WorldEvents,
    savedEncounterPoints: EncounterPoints = { earnedOn: todayReset, halfPoints: 0 },
    { getWorldNow, worldNow } = createWorldClock(afterReset),
  ) =>
    useWorldCommissions({
      ...baseCommissions,
      events,
      getWorldNow,
      savedCommissionDay: {
        claimedCommissionIds: [],
        dealtAt: todayReset,
        dealtCommissions: [],
        isBonusClaimed: false,
      },
      savedEncounterPoints,
      worldNow,
    });

  // The four unfinished commissions of a kept day, with one whole Encounter Point held, read as the world opens at the given rank
  const useUnfinishedDay = (rank: number) => {
    const { getWorldNow, worldNow } = createWorldClock(afterReset);
    vi.mocked(readCommissionSlices).mockResolvedValue([createSlice()]);
    return useWorldCommissions({
      ...baseCommissions,
      events: createWorldEvents(),
      getWorldNow,
      rank: computed(() => rank),
      savedCommissionDay: {
        claimedCommissionIds: [],
        dealtAt: todayReset,
        dealtCommissions: [2, 3, 4, 5].map((commissionId) => ({ commissionId, count: 0, dealtRank: RANK })),
        isBonusClaimed: false,
      },
      savedEncounterPoints: { earnedOn: todayReset, halfPoints: 2 },
      worldNow,
    });
  };

  test("a day dealt before the daily reset is dealt again", async () => {
    expect.hasAssertions();
    const { getWorldNow, worldNow } = createWorldClock(afterReset);
    vi.mocked(readCommissionSlices).mockResolvedValue([createSlice()]);
    const { commissionDay } = useWorldCommissions({
      ...baseCommissions,
      events: createWorldEvents(),
      getWorldNow,
      savedCommissionDay: {
        claimedCommissionIds: [1],
        dealtAt: todayReset.subtract({ minutes: 1 }),
        dealtCommissions: [{ commissionId: 1, count: 3, dealtRank: RANK }],
        isBonusClaimed: false,
      },
      savedEncounterPoints: { earnedOn: todayReset, halfPoints: 0 },
      savedLongTermEncounterPoints: { halfPoints: 0, majorVersion: 0 },
      worldNow,
    });
    await flushReads();
    expect(commissionDay.value.dealtCommissions).toHaveLength(4);
    expect(commissionDay.value.claimedCommissionIds).toStrictEqual([]);
    expect(commissionDay.value.dealtAt.toString()).toBe(afterReset.toString());
  });

  test("a finished Archon quest earns four Encounter Points, and a World quest earns none", () => {
    expect.hasAssertions();
    const events = createWorldEvents();
    const { encounterPoints } = useAfterReset(events);
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
    const { longTermEncounterPoints } = useAfterReset(events, { earnedOn: todayReset, halfPoints: 4 });
    events.emit(
      "finishQuest",
      { id: "archon", kind: QuestKind.Archon } as Quest,
      {} as QuestProgress,
      {} as QuestProgress,
    );
    expect(longTermEncounterPoints.value).toStrictEqual({ halfPoints: 4, majorVersion: LONG_TERM_MAJOR_VERSION });
  });

  test("the whole Encounter Points held lapse at the next daily reset with no write", () => {
    expect.hasAssertions();
    const clock = createWorldClock(afterReset);
    const { wholeEncounterPoints } = useAfterReset(createWorldEvents(), { earnedOn: todayReset, halfPoints: 2 }, clock);
    expect(wholeEncounterPoints.value).toBe(1);
    clock.moveTo(nextReset);
    expect(wholeEncounterPoints.value).toBe(0);
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
    await flushReads();
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
    await flushReads();
    expect(isAdventureEncountersUnlocked.value).toBe(true);
    expect(handbookDayCommissions.value.map(({ isClaimable }) => isClaimable)).toStrictEqual([true, true, true, true]);
  });
});
