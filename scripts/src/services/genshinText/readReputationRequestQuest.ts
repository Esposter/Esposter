import type { DumpedGiving } from "#src/models/genshinText/DumpedGiving";
import type { DumpedMainQuest } from "#src/models/genshinText/DumpedMainQuest";
import type { DumpedSubQuest } from "#src/models/genshinText/DumpedSubQuest";
import type { Quest } from "genshin-world";

import { readGivingObjectives } from "#src/services/genshinText/readGivingObjectives";
import { QuestKind, questSchema } from "genshin-world";

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
    mainId: String(mainQuest.id),
    offerTalkIds: [],
    parentQuestIds: [],
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
