import type { AchievementEvent } from "#src/models/achievement/AchievementEvent";
import type { Quest } from "#src/models/quest/Quest";
import type { QuestEvent } from "#src/models/quest/QuestEvent";
import type { QuestProgress } from "#src/models/quest/QuestProgress";
import type { WorldEvents } from "#src/models/world/WorldEvents";
import type { GameLanguage } from "genshin-text";

import { AchievementEventKind } from "#src/models/achievement/AchievementEventKind";
import { checkIsQuestFinished } from "#src/services/quest/checkIsQuestFinished";
import { getFinishedQuestEvents } from "#src/services/quest/getFinishedQuestEvents";
import { advanceQuest } from "#src/services/quest/advanceQuest";
import { QuestTextLoaderMap } from "#src/services/quest/QuestTextLoaderMap";
import { readQuests } from "#src/services/quest/readQuests";
import { startQuests } from "#src/services/quest/startQuests";
import { getResultAsync } from "@esposter/shared";

// The carried quests, read as the world starts, with how far each has come. A quest shows once it starts, and a finished
// One stays in the progress map at its last step, so the quests in progress are those started and not yet finished. Each
// Quest event the world records is handed to every quest in progress, and the steps and quests it finishes reach the
// Achievements and the Travel Log
export const useWorldQuests = ({
  events,
  language,
  savedQuestProgressMap,
}: {
  events: WorldEvents;
  language: GameLanguage;
  savedQuestProgressMap: ReadonlyMap<string, QuestProgress>;
}) => {
  const quests = shallowRef<Quest[]>([]);
  const questProgressMap = shallowRef<ReadonlyMap<string, QuestProgress>>(savedQuestProgressMap);
  const questsInProgress = computed(() =>
    quests.value.filter((quest) => {
      const progress = questProgressMap.value.get(quest.id);
      return progress !== undefined && !checkIsQuestFinished(quest, progress);
    }),
  );
  const questTextMap = shallowRef<Readonly<Record<string, string>>>({});
  // The main quests done, by id. The Archive opens once the quest it opens after is among them
  const finishedMainQuestIds = computed(
    () =>
      new Set(
        quests.value
          .filter((quest) => checkIsQuestFinished(quest, questProgressMap.value.get(quest.id)))
          .map(({ id }) => Number(id)),
      ),
  );
  const trackedQuestId = ref("");
  // The quest on the HUD's tracker, the one navigated to or with none the first in progress, which V navigates to, and the
  // Navigated one's objective, which its beam rises over
  const trackerQuest = computed(
    () => questsInProgress.value.find(({ id }) => id === trackedQuestId.value) ?? questsInProgress.value[0],
  );
  const questTargetId = computed(() => {
    if (!trackedQuestId.value || !trackerQuest.value) return "";
    const { id, steps } = trackerQuest.value;
    return steps[questProgressMap.value.get(id)?.stepIndex ?? 0]?.objectives[0]?.targetId ?? "";
  });
  // oxlint-disable-next-line typescript/no-floating-promises -- match() handles both branches, so the promise it returns cannot reject and nothing waits on it
  getResultAsync(readQuests).match(
    (newQuests) => {
      quests.value = newQuests;
      questProgressMap.value = startQuests(newQuests, questProgressMap.value);
    },
    (error) => {
      console.error(error);
    },
  );
  // oxlint-disable-next-line typescript/no-floating-promises -- match() handles both branches, so the promise it returns cannot reject and nothing waits on it
  getResultAsync(() => QuestTextLoaderMap[language]()).match(
    (newQuestTextMap) => {
      questTextMap.value = newQuestTextMap;
    },
    (error) => {
      console.error(error);
    },
  );
  const doQuestEvent = (questEvent: QuestEvent) => {
    const nextProgressMap = new Map(questProgressMap.value);
    const achievementEvents: AchievementEvent[] = [];
    for (const quest of questsInProgress.value) {
      const progress = nextProgressMap.get(quest.id);
      if (!progress) continue;
      const nextProgress = advanceQuest(quest, progress, questEvent);
      nextProgressMap.set(quest.id, nextProgress);
      achievementEvents.push(...getFinishedQuestEvents(quest, progress, nextProgress));
    }
    questProgressMap.value = startQuests(quests.value, nextProgressMap);
    events.emit("achievementEvents", achievementEvents);
    if (achievementEvents.some(({ kind }) => kind === AchievementEventKind.ParentQuestFinished))
      events.emit("parentQuestFinish");
  };
  events.on("questEvent", doQuestEvent);
  return {
    finishedMainQuestIds,
    questProgressMap,
    questsInProgress,
    questTargetId,
    questTextMap,
    trackedQuestId,
    trackerQuest,
  };
};
