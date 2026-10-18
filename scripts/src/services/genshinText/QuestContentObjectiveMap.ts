import type { QuestContentObjective } from "#src/models/genshinText/QuestContentObjective";

import { QuestObjectiveKind } from "genshin-world";

// The condition types a quest step finishes on that ask something of the Traveler or the world, by the dump's own code:
// Reaching a place's trigger or a room, a talk ended, a waypoint unlocked (its point the second parameter, after its
// Scene), a thing acted on or broken, an item obtained and an enemy defeated, and of the world's own state, a plot
// Finished (its plot the first parameter, which is a talk to the reader where the plot is a talk the world plays),
// Being present in a scene and a game time tick (its days the first parameter, its window of hours its text). A script's
// Own notice or a state read asks nothing the Traveler does, so it has no objective
export const QuestContentObjectiveMap: Readonly<Record<string, QuestContentObjective>> = {
  QUEST_CONTENT_COMPLETE_ANY_TALK: { kind: QuestObjectiveKind.TalkTo, targetIndex: 0 },
  QUEST_CONTENT_COMPLETE_TALK: { kind: QuestObjectiveKind.TalkTo, targetIndex: 0 },
  QUEST_CONTENT_DESTROY_GADGET: { kind: QuestObjectiveKind.Interact, targetIndex: 0 },
  QUEST_CONTENT_ENTER_DUNGEON: { kind: QuestObjectiveKind.GoTo, targetIndex: 0 },
  QUEST_CONTENT_ENTER_ROOM: { kind: QuestObjectiveKind.GoTo, targetIndex: 0 },
  QUEST_CONTENT_FINISH_PLOT: { kind: QuestObjectiveKind.Plot, targetIndex: 0 },
  QUEST_CONTENT_GAME_TIME_TICK: { kind: QuestObjectiveKind.Wait, targetIndex: 0 },
  QUEST_CONTENT_INTERACT_GADGET: { kind: QuestObjectiveKind.Interact, targetIndex: 0 },
  QUEST_CONTENT_KILL_MONSTER: { kind: QuestObjectiveKind.Defeat, targetIndex: 0 },
  QUEST_CONTENT_MONSTER_DIE: { kind: QuestObjectiveKind.Defeat, targetIndex: 0 },
  QUEST_CONTENT_OBTAIN_ITEM: { kind: QuestObjectiveKind.Collect, targetIndex: 0 },
  QUEST_CONTENT_PRESENT_AT_SPECIFIC_SCENE: { kind: QuestObjectiveKind.Scene, targetIndex: 0 },
  QUEST_CONTENT_TRIGGER_FIRE: { kind: QuestObjectiveKind.GoTo, targetIndex: 0 },
  QUEST_CONTENT_UNLOCK_TRANS_POINT: { kind: QuestObjectiveKind.Interact, targetIndex: 1 },
};
