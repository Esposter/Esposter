import type { GcgLevels } from "#src/models/gcg/GcgLevels";
import type { Resident } from "#src/models/world/Resident";
import type { ComputedRef, Ref } from "vue";

import { checkIsGcgResidentDuelOpen } from "#src/services/gcg/checkIsGcgResidentDuelOpen";
import { computeGcgPlayerLevel } from "#src/services/gcg/computeGcgPlayerLevel";
import { readGcgLevels } from "#src/services/gcg/readGcgLevels";
import { getResultAsync } from "@esposter/shared";
import { computed, shallowRef } from "vue";

// The card game's Player Level, read from the EXP the player holds, the tutorial quest and the locks the main quests hold,
// and whether a resident's duel is open at it. The levels load once; until they are read, the Player Level is zero
export const useGcgPlayerLevel = ({
  cardGameExp,
  finishedMainQuestIds,
  gameDataBaseUrl,
  isTutorialQuestFinished,
}: {
  cardGameExp: Ref<number>;
  finishedMainQuestIds: ComputedRef<ReadonlySet<number>>;
  gameDataBaseUrl: string;
  isTutorialQuestFinished: ComputedRef<boolean>;
}) => {
  const gcgLevels = shallowRef<GcgLevels>();
  // oxlint-disable-next-line typescript/no-floating-promises -- match() handles both branches, so the promise it returns cannot reject and nothing waits on it
  getResultAsync(() => readGcgLevels(gameDataBaseUrl)).match(
    (newGcgLevels) => {
      gcgLevels.value = newGcgLevels;
    },
    (error) => {
      console.error(error);
    },
  );
  // The lock names its main quest by its id as text, the way the game's quest tables hold it
  const finishedMainQuestIdStrings = computed(() => new Set(Array.from(finishedMainQuestIds.value, String)));
  const playerLevel = computed(() =>
    gcgLevels.value === undefined
      ? 0
      : computeGcgPlayerLevel(
          cardGameExp.value,
          gcgLevels.value.playerLevels,
          isTutorialQuestFinished.value,
          gcgLevels.value.playerLevelLocks,
          finishedMainQuestIdStrings.value,
        ),
  );
  const checkIsResidentGcgDuelOpen = (resident: Resident) =>
    checkIsGcgResidentDuelOpen(resident, gcgLevels.value?.challengerGames, playerLevel.value);
  return { checkIsResidentGcgDuelOpen };
};
