import type { WorldEvents } from "#src/models/world/WorldEvents";

import { QuestObjectiveKind } from "#src/models/quest/QuestObjectiveKind";
import { shallowRef } from "vue";

// The game of the card game being played now, which a talk or a week board started, and leaving it: a won duel is the win
// The quests' win objectives count, whatever the game was, and the game is no longer being played once the player leaves
export const useWorldGcgDuel = ({ events }: { events: WorldEvents }) => {
  const gcgGameId = shallowRef<number>();
  const leaveGcgDuel = (won: boolean) => {
    if (won && gcgGameId.value !== undefined)
      events.emit("questEvent", { kind: QuestObjectiveKind.Win, targetId: String(gcgGameId.value) });
    gcgGameId.value = undefined;
  };
  return { gcgGameId, leaveGcgDuel };
};
