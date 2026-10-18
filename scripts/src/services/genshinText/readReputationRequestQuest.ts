import type { DumpedGiving } from "#src/models/genshinText/DumpedGiving";
import type { DumpedGivingGroup } from "#src/models/genshinText/DumpedGivingGroup";
import type { DumpedMainQuest } from "#src/models/genshinText/DumpedMainQuest";
import type { DumpedSubQuest } from "#src/models/genshinText/DumpedSubQuest";
import type { Quest, QuestObjective } from "genshin-world";

import { QuestKind, QuestObjectiveKind, questSchema } from "genshin-world";

// The giving method a food request names its groups by, the other naming its exact items
const GIVING_METHOD_GROUP = "GIVING_METHOD_GROUP";

// An exact row asks for each of its items by its count, and a food row for the count of any one item of the groups it
// Names
const readRequestObjectives = (
  giving: DumpedGiving,
  givingGroupMap: ReadonlyMap<number, DumpedGivingGroup>,
): QuestObjective[] => {
  if (giving.givingMethod === GIVING_METHOD_GROUP) {
    const targetIds = (giving.givingGroupIds ?? []).flatMap((groupId) => givingGroupMap.get(groupId)?.itemIds ?? []);
    return [
      { count: giving.givingGroupCount ?? 0, kind: QuestObjectiveKind.Collect, targetIds: targetIds.map(String) },
    ];
  }
  return giving.exactItems.flatMap(({ count, id }) =>
    id === 0 ? [] : [{ count, kind: QuestObjectiveKind.Collect, targetIds: [String(id)] }],
  );
};

// A Reputation delivery request as the dump files it: a sub quest of a world quest, whose items a giving row of its own
// Id asks for. Its one step collects them, and no talk offers it, since the keeper's request board does. Its rewards are
// Its world quest's, which the Reputation levels pay
export const readReputationRequestQuest = ({
  giving,
  givingGroupMap,
  mainQuest,
  rewards,
  subQuest,
}: {
  giving: DumpedGiving;
  givingGroupMap: ReadonlyMap<number, DumpedGivingGroup>;
  mainQuest: DumpedMainQuest;
  rewards: Quest["rewards"];
  subQuest: DumpedSubQuest;
}): Quest =>
  questSchema.parse({
    descriptionTextId: String(mainQuest.descTextMapHash),
    id: String(subQuest.subId),
    kind: QuestKind.World,
    offerTalkIds: [],
    parentQuestIds: [],
    rewards,
    steps: [
      {
        id: String(subQuest.subId),
        objectives: readRequestObjectives(giving, givingGroupMap),
        textId: String(subQuest.stepDescTextMapHash),
      },
    ],
    talks: [],
    titleTextId: String(mainQuest.titleTextMapHash),
  });
