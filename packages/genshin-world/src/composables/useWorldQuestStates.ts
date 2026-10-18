import type { Quest } from "#src/models/quest/Quest";
import type { QuestProgress } from "#src/models/quest/QuestProgress";
import type { WorldEvents } from "#src/models/world/WorldEvents";
import type { GameClock } from "genshin-engine";
import type { Ref } from "vue";

import { getQuestStateEvents } from "#src/services/quest/getQuestStateEvents";
import { getQuestStepStartDays } from "#src/services/quest/getQuestStepStartDays";
import { watch } from "vue";

// The quests whose steps wait on the world's own state rather than on a doing: a plot, a scene the player is in, a day
// And an hour on the clock. The world checks them whenever the quests move, and the session checks them again on an
// Interval with the returned check, since the clock and a skip of the Time screen move them with no quest event. A check
// Records the first state event it finds as a quest event, and the next follows the quests that event moved, so each
// Event is read against the quests as they now stand
export const useWorldQuestStates = ({
  events,
  getGameClock,
  getSceneId,
  questProgressMap,
  quests,
}: {
  events: WorldEvents;
  getGameClock: () => GameClock | undefined;
  getSceneId: () => string;
  questProgressMap: Ref<ReadonlyMap<string, QuestProgress>>;
  quests: Ref<Quest[]>;
}) => {
  let stepStartDays: ReadonlyMap<string, number> = new Map();
  const checkQuestStates = () => {
    const gameClock = getGameClock();
    if (!gameClock) return;
    stepStartDays = getQuestStepStartDays(quests.value, questProgressMap.value, gameClock.days, stepStartDays);
    const [questEvent] = getQuestStateEvents(
      quests.value,
      questProgressMap.value,
      { days: gameClock.days, minutes: gameClock.minutes, sceneId: getSceneId() },
      stepStartDays,
    );
    if (questEvent) events.emit("questEvent", questEvent);
  };
  watch([quests, questProgressMap], checkQuestStates);
  return { checkQuestStates };
};
