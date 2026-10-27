import type { QuestContentObjective } from "#src/models/genshinText/QuestContentObjective";

import { QuestObjectiveKind } from "genshin-world";
import { QuestContentCondition } from "#src/models/genshinText/QuestContentCondition";

// The condition types a quest step finishes on that ask something of the Traveler, by the dump's own code: reaching a
// Place's trigger or a room, a talk ended, a waypoint unlocked (its point the second parameter, after its scene), a
// Thing acted on or broken, an item obtained and an enemy defeated. A cutscene played, a script's own notice or a state
// Read asks nothing the Traveler does, so it has no objective
export const QuestContentObjectiveMap: Readonly<Record<string, QuestContentObjective>> = {
  [QuestContentCondition.QuestContentCompleteAnyTalk]: { kind: QuestObjectiveKind.TalkTo, targetIndex: 0 },
  [QuestContentCondition.QuestContentCompleteTalk]: { kind: QuestObjectiveKind.TalkTo, targetIndex: 0 },
  [QuestContentCondition.QuestContentDestroyGadget]: { kind: QuestObjectiveKind.Interact, targetIndex: 0 },
  [QuestContentCondition.QuestContentEnterDungeon]: { kind: QuestObjectiveKind.GoTo, targetIndex: 0 },
  [QuestContentCondition.QuestContentEnterRoom]: { kind: QuestObjectiveKind.GoTo, targetIndex: 0 },
  [QuestContentCondition.QuestContentInteractGadget]: { kind: QuestObjectiveKind.Interact, targetIndex: 0 },
  [QuestContentCondition.QuestContentKillMonster]: { kind: QuestObjectiveKind.Defeat, targetIndex: 0 },
  [QuestContentCondition.QuestContentMonsterDie]: { kind: QuestObjectiveKind.Defeat, targetIndex: 0 },
  [QuestContentCondition.QuestContentObtainItem]: { kind: QuestObjectiveKind.Collect, targetIndex: 0 },
  [QuestContentCondition.QuestContentTriggerFire]: { kind: QuestObjectiveKind.GoTo, targetIndex: 0 },
  [QuestContentCondition.QuestContentUnlockTransPoint]: { kind: QuestObjectiveKind.Interact, targetIndex: 1 },
};
