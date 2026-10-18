import type { AchievementEvent } from "#src/models/achievement/AchievementEvent";
import type { Quest } from "#src/models/quest/Quest";
import type { QuestChapter } from "#src/models/quest/QuestChapter";
import type { QuestEvent } from "#src/models/quest/QuestEvent";
import type { QuestProgress } from "#src/models/quest/QuestProgress";
import type { WorldEvents } from "#src/models/world/WorldEvents";
import type { GameLanguage } from "genshin-text";

import { AchievementEventKind } from "#src/models/achievement/AchievementEventKind";
import { advanceQuest } from "#src/services/quest/advanceQuest";
import { checkIsQuestFinished } from "#src/services/quest/checkIsQuestFinished";
import { computeQuestStepTargets } from "#src/services/quest/computeQuestStepTargets";
import { getFinishedQuestEvents } from "#src/services/quest/getFinishedQuestEvents";
import { getQuestTargetId } from "#src/services/quest/getQuestTargetId";
import { QuestTextLoaderMap } from "#src/services/quest/QuestTextLoaderMap";
import { readQuestChapters } from "#src/services/quest/readQuestChapters";
import { readQuests } from "#src/services/quest/readQuests";
import { startQuests } from "#src/services/quest/startQuests";
import { getResultAsync } from "@esposter/shared";

// The carried quests, read as the world starts, with how far each has come. A quest shows once it starts, and a finished
// One stays in the progress map at its last step, so the quests in progress are those started and not yet finished. Each
// Quest event the world records is handed to every quest in progress, the steps and quests it finishes reach the
// Achievements and the Travel Log, and a talk that ends starts each quest it offers
export const useWorldQuests = ({
  events,
  gameDataBaseUrl,
  language,
  savedQuestProgressMap,
}: {
  events: WorldEvents;
  gameDataBaseUrl: string;
  language: GameLanguage;
  savedQuestProgressMap: ReadonlyMap<string, QuestProgress>;
}) => {
  const quests = shallowRef<Quest[]>([]);
  const questChapters = shallowRef<QuestChapter[]>([]);
  const questProgressMap = shallowRef<ReadonlyMap<string, QuestProgress>>(savedQuestProgressMap);
  const questsInProgress = computed(() =>
    quests.value.filter((quest) => {
      const progress = questProgressMap.value.get(quest.id);
      return progress !== undefined && !checkIsQuestFinished(quest, progress);
    }),
  );
  // The quests a talk offers that have not started yet, whose offering talks the world holds until one of them ends
  const questsOffered = computed(() =>
    quests.value.filter(({ id, offerTalkIds }) => offerTalkIds.length > 0 && !questProgressMap.value.has(id)),
  );
  // The Interact targets the quests name, and those their reached steps name, which hide a listed transport point
  const questStepTargets = computed(() => computeQuestStepTargets(quests.value, questProgressMap.value));
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
  // What the navigated quest's step sends the player to, which the beam rises over
  const questTargetId = computed(() =>
    trackedQuestId.value && trackerQuest.value
      ? getQuestTargetId(trackerQuest.value, questProgressMap.value.get(trackerQuest.value.id))
      : "",
  );
  // A chapter read that fails is logged and leaves the series unlisted, so the quests still load without them
  const readQuestChaptersOrEmpty = () =>
    getResultAsync(() => readQuestChapters(gameDataBaseUrl)).match(
      (newQuestChapters) => newQuestChapters,
      (error) => {
        console.error(error);
        return [];
      },
    );
  // oxlint-disable-next-line typescript/no-floating-promises -- match() handles both branches, so the promise it returns cannot reject and nothing waits on it
  getResultAsync(() => Promise.all([readQuests(gameDataBaseUrl), readQuestChaptersOrEmpty()])).match(
    ([newQuests, newQuestChapters]) => {
      quests.value = newQuests;
      questChapters.value = newQuestChapters;
      questProgressMap.value = startQuests(newQuests, questProgressMap.value, undefined, newQuestChapters);
    },
    (error) => {
      console.error(error);
    },
  );
  // oxlint-disable-next-line typescript/no-floating-promises -- match() handles both branches, so the promise it returns cannot reject and nothing waits on it
  getResultAsync(() => QuestTextLoaderMap[language](gameDataBaseUrl)).match(
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
      if (checkIsQuestFinished(quest, nextProgress) && !checkIsQuestFinished(quest, progress))
        events.emit("finishQuest", quest, progress, nextProgress);
    }
    questProgressMap.value = startQuests(quests.value, nextProgressMap, questEvent, questChapters.value);
    events.emit("achievementEvents", achievementEvents);
    if (achievementEvents.some(({ kind }) => kind === AchievementEventKind.ParentQuestFinished))
      events.emit("parentQuestFinish");
  };
  events.on("questEvent", doQuestEvent);
  return {
    finishedMainQuestIds,
    questChapters,
    questProgressMap,
    quests,
    questsInProgress,
    questsOffered,
    questStepTargets,
    questTargetId,
    questTextMap,
    trackedQuestId,
    trackerQuest,
  };
};
