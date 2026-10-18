import type { DumpedGiving } from "#src/models/genshinText/DumpedGiving";
import type { DumpedMainQuest } from "#src/models/genshinText/DumpedMainQuest";
import type { DumpedSubQuest } from "#src/models/genshinText/DumpedSubQuest";
import type { Quest, QuestObjective } from "genshin-world";

import { InvalidOperationError, Operation } from "@esposter/shared";
import { QuestKind, QuestObjectiveKind, questSchema } from "genshin-world";

// A giving's objectives: each exact item collected its count, or, for a giving by group, one of the group's items collected
// Its count, the first item as the target and the rest as its alternatives, which a single collect of an item names as well
const readGivingObjectives = (giving: DumpedGiving, groupItemIds: number[]): QuestObjective[] => {
  if (giving.givingGroupCount === undefined)
    return giving.exactItems.flatMap(({ count, id }) =>
      id === 0 ? [] : [{ count, kind: QuestObjectiveKind.Collect, targetId: String(id) }],
    );
  const [firstItemId, ...alternativeItemIds] = groupItemIds;
  if (firstItemId === undefined)
    throw new InvalidOperationError(Operation.Read, String(giving.id), "gives by a group that holds no items");
  return [
    {
      ...(alternativeItemIds.length > 0 ? { alternativeTargetIds: alternativeItemIds.map(String) } : {}),
      count: giving.givingGroupCount,
      kind: QuestObjectiveKind.Collect,
      targetId: String(firstItemId),
    },
  ];
};

// A Reputation delivery request as the dump files it: a sub quest of a world quest, whose items a giving row of its own
// Id asks for, either exactly or by the items of the groups it names. Its one step collects them, the objective the dump's
// Obtain-item condition maps to, and no talk offers it, since the keeper's request board does. Its rewards are its world
// Quest's, which the Reputation levels pay
export const readReputationRequestQuest = ({
  giving,
  groupItemIds,
  mainQuest,
  rewards,
  subQuest,
}: {
  giving: DumpedGiving;
  groupItemIds: number[];
  mainQuest: DumpedMainQuest;
  rewards: Quest["rewards"];
  subQuest: DumpedSubQuest;
}): Quest =>
  questSchema.parse({
    descriptionTextId: String(mainQuest.descTextMapHash),
    id: String(subQuest.subId),
    kind: QuestKind.World,
    offerTalkIds: [],
    rewards,
    steps: [
      {
        id: String(subQuest.subId),
        objectives: readGivingObjectives(giving, groupItemIds),
        textId: String(subQuest.stepDescTextMapHash),
      },
    ],
    talks: [],
    titleTextId: String(mainQuest.titleTextMapHash),
  });
