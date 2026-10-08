import type { QuestContentObjective } from "#src/models/genshinText/QuestContentObjective";

import { QuestObjectiveKind } from "genshin-world";

// The condition types a quest step finishes on that ask something of the Traveler, by the dump's own code: reaching a
// Place's trigger or a room, a talk ended, a waypoint unlocked (its point the second parameter, after its scene), a
// Thing acted on or broken, an item obtained and an enemy defeated. A cutscene played, a script's own notice or a state
// Read asks nothing the Traveler does, so it has no objective
export const QuestContentObjectiveMap: Readonly<Record<string, QuestContentObjective>> = {
  QUEST_CONTENT_COMPLETE_ANY_TALK: { kind: QuestObjectiveKind.TalkTo, targetIndex: 0 },
  QUEST_CONTENT_COMPLETE_TALK: { kind: QuestObjectiveKind.TalkTo, targetIndex: 0 },
  QUEST_CONTENT_DESTROY_GADGET: { kind: QuestObjectiveKind.Interact, targetIndex: 0 },
  QUEST_CONTENT_ENTER_DUNGEON: { kind: QuestObjectiveKind.GoTo, targetIndex: 0 },
  QUEST_CONTENT_ENTER_ROOM: { kind: QuestObjectiveKind.GoTo, targetIndex: 0 },
  QUEST_CONTENT_INTERACT_GADGET: { kind: QuestObjectiveKind.Interact, targetIndex: 0 },
  QUEST_CONTENT_KILL_MONSTER: { kind: QuestObjectiveKind.Defeat, targetIndex: 0 },
  QUEST_CONTENT_MONSTER_DIE: { kind: QuestObjectiveKind.Defeat, targetIndex: 0 },
  QUEST_CONTENT_OBTAIN_ITEM: { kind: QuestObjectiveKind.Collect, targetIndex: 0 },
  QUEST_CONTENT_TRIGGER_FIRE: { kind: QuestObjectiveKind.GoTo, targetIndex: 0 },
  QUEST_CONTENT_UNLOCK_TRANS_POINT: { kind: QuestObjectiveKind.Interact, targetIndex: 1 },
};
