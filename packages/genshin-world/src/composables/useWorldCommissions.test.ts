import type { CommissionSlice } from "#src/models/commission/CommissionSlice";
import type { Quest } from "#src/models/quest/Quest";
import type { QuestProgress } from "#src/models/quest/QuestProgress";

import { useWorldCommissions } from "#src/composables/useWorldCommissions";
import { CommissionFinishKind } from "#src/models/commission/CommissionFinishKind";
import { CommissionKind } from "#src/models/commission/CommissionKind";
import { DAILY_RESET_TIME } from "#src/services/enemy/constants";
import { readCommissionSlices } from "#src/services/commission/readCommissionSlices";
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

describe(useWorldCommissions, () => {
  test("a day dealt before the daily reset is dealt again", async () => {
    expect.hasAssertions();
    // The reset is read in the reader's own zone, so the day before it and the day after it are built in that zone too
    const zone = Temporal.Now.timeZoneId();
    const todayReset = Temporal.Now.zonedDateTimeISO(zone)
      .toPlainDate()
      .toZonedDateTime({ plainTime: DAILY_RESET_TIME, timeZone: zone });
    const now = todayReset.add({ hours: 1 });
    vi.mocked(readCommissionSlices).mockResolvedValue([createSlice()]);
    const { commissionDay } = useWorldCommissions({
      events: createWorldEvents(),
      finishedMainQuestIds: computed(() => new Set<number>()),
      gameDataBaseUrl: "",
      getWorldNow: () => now.toInstant(),
      questProgressMap: shallowRef(new Map<string, QuestProgress>()),
      questsInProgress: computed<Quest[]>(() => []),
      rank: computed(() => RANK),
      savedCommissionDay: {
        claimedCommissionIds: [1],
        dealtAt: todayReset.subtract({ minutes: 1 }).toInstant(),
        dealtCommissions: [{ commissionId: 1, count: 3, dealtRank: RANK }],
      },
    });
    await waitForReads();
    expect(commissionDay.value.dealtCommissions).toHaveLength(4);
    expect(commissionDay.value.claimedCommissionIds).toStrictEqual([]);
    expect(commissionDay.value.dealtAt).toStrictEqual(now.toInstant());
  });
});
