import type { CommissionDay } from "#src/models/commission/CommissionDay";
import type { CommissionSlice } from "#src/models/commission/CommissionSlice";
import type { EncounterPoints } from "#src/models/commission/EncounterPoints";
import type { Quest } from "#src/models/quest/Quest";
import type { QuestProgress } from "#src/models/quest/QuestProgress";
import type { WorldEvents } from "#src/models/world/WorldEvents";
import type { ComputedRef, Ref } from "vue";

import { advanceCommissionForQuest } from "#src/services/commission/advanceCommissionForQuest";
import { computeCommissionDay } from "#src/services/commission/computeCommissionDay";
import { computeEncounterPointStorage } from "#src/services/commission/computeEncounterPointStorage";
import { earnEncounterPoints } from "#src/services/commission/earnEncounterPoints";
import { getQuestEncounterHalfPoints } from "#src/services/commission/getQuestEncounterHalfPoints";
import { joinCommissionPool } from "#src/services/commission/joinCommissionPool";
import { readCommissionSlices } from "#src/services/commission/readCommissionSlices";
import { readEncounterPoints } from "#src/services/commission/readEncounterPoints";
import { toHandbookDayCommissions } from "#src/services/handbook/toHandbookDayCommissions";
import { getQuestTargetId } from "#src/services/quest/getQuestTargetId";
import { getResultAsync } from "@esposter/shared";
import { computed, shallowRef } from "vue";

// The day's commissions the session holds: every region's daily tasks read as the world opens, and the day dealt again from
// Them once the save is loaded when it was dealt before the latest daily reset. A quest in progress that finishes finishes
// Its quest task, and a load that fails is logged and left with no day dealt, so no commission is offered rather than a wrong one
export const useWorldCommissions = ({
  events,
  finishedMainQuestIds,
  gameDataBaseUrl,
  getWorldNow,
  questProgressMap,
  questsInProgress,
  rank,
  savedCommissionDay,
  savedEncounterPoints,
}: {
  events: WorldEvents;
  finishedMainQuestIds: ComputedRef<ReadonlySet<number>>;
  gameDataBaseUrl: string;
  getWorldNow: () => Temporal.Instant;
  questProgressMap: Ref<ReadonlyMap<string, QuestProgress>>;
  questsInProgress: ComputedRef<Quest[]>;
  rank: ComputedRef<number>;
  savedCommissionDay: CommissionDay;
  savedEncounterPoints: EncounterPoints;
}) => {
  const commissionSlices = shallowRef<CommissionSlice[]>([]);
  const commissionDay = shallowRef<CommissionDay>(savedCommissionDay);
  const encounterPoints = shallowRef<EncounterPoints>(savedEncounterPoints);
  // Every region's tasks as one slice, which a dealt commission is found among whichever region it is preferred in
  const commissionSlice = computed<CommissionSlice | undefined>(() => {
    const [firstSlice] = commissionSlices.value;
    if (!firstSlice) return undefined;
    return {
      bonuses: firstSlice.bonuses,
      rewardTiers: firstSlice.rewardTiers,
      tasks: commissionSlices.value.flatMap(({ tasks }) => tasks),
    };
  });
  // oxlint-disable-next-line typescript/no-floating-promises -- match() handles both branches, so the promise it returns cannot reject and nothing waits on it
  getResultAsync(() => readCommissionSlices(gameDataBaseUrl)).match(
    (slices) => {
      commissionSlices.value = slices;
      const now = getWorldNow();
      const heldPlaces = new Set(
        questsInProgress.value.map((quest) => getQuestTargetId(quest, questProgressMap.value.get(quest.id))),
      );
      commissionDay.value = computeCommissionDay(
        savedCommissionDay,
        now,
        joinCommissionPool(slices, finishedMainQuestIds.value),
        heldPlaces,
        rank.value,
        Math.random,
      );
    },
    (error) => {
      console.error(error);
    },
  );
  // A quest's completion advances its commission task and earns the Encounter Points its kind gives, held up to the storage the
  // Day's finished commissions leave, which is read after the advance so a commission finished by this quest counts
  events.on("finishQuest", (quest) => {
    if (commissionSlice.value)
      commissionDay.value = advanceCommissionForQuest(commissionDay.value, commissionSlice.value, quest.id);
    const halfPoints = getQuestEncounterHalfPoints(quest.kind);
    if (halfPoints > 0)
      encounterPoints.value = earnEncounterPoints(
        readEncounterPoints(encounterPoints.value, getWorldNow()),
        halfPoints,
        computeEncounterPointStorage(commissionDay.value, commissionSlice.value),
      );
  });
  // The day's four as the Adventurer Handbook's Commissions tab lists them, none while no region's tasks are read
  const handbookDayCommissions = computed(() =>
    commissionSlice.value ? toHandbookDayCommissions(commissionDay.value, commissionSlice.value) : [],
  );
  return { commissionDay, commissionSlice, encounterPoints, handbookDayCommissions };
};
