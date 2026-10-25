import type { DumpedGiving } from "#src/models/genshinText/DumpedGiving";
import type { QuestObjective } from "genshin-world";

import { InvalidOperationError, Operation } from "@esposter/shared";
import { QuestObjectiveKind } from "genshin-world";

// A giving's objectives: each exact item collected its count, or, for a giving by group, any one of the group's items collected
// Its count, with every one of the group's items named as its targets. A zero count is an exact giving's, since the dump's
// Defaults write it into every row that leaves the count out
export const readGivingObjectives = (giving: DumpedGiving, groupItemIds: number[]): QuestObjective[] => {
  if (!giving.givingGroupCount)
    return giving.exactItems.flatMap(({ count, id }) =>
      id === 0 ? [] : [{ count, kind: QuestObjectiveKind.Collect, targetIds: [String(id)] }],
    );
  if (groupItemIds.length === 0)
    throw new InvalidOperationError(Operation.Read, String(giving.id), "gives by a group that holds no items");
  return [{ count: giving.givingGroupCount, kind: QuestObjectiveKind.Collect, targetIds: groupItemIds.map(String) }];
};
