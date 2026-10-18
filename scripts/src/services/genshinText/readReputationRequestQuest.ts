import type { DumpedGiving } from "#src/models/genshinText/DumpedGiving";
import type { DumpedMainQuest } from "#src/models/genshinText/DumpedMainQuest";
import type { DumpedSubQuest } from "#src/models/genshinText/DumpedSubQuest";
import type { Quest } from "genshin-world";

import { QuestKind, QuestObjectiveKind, questSchema } from "genshin-world";

// A Reputation delivery request as the dump files it: a sub quest of a world quest, whose items a giving row of its own
// Id asks for. Its one step collects each item, the objective the dump's obtain-item condition maps to, and no talk
// Offers it, since the keeper's request board does
export const readReputationRequestQuest = ({
  giving,
  mainQuest,
  subQuest,
}: {
  giving: DumpedGiving;
  mainQuest: DumpedMainQuest;
  subQuest: DumpedSubQuest;
}): Quest =>
  questSchema.parse({
    descriptionTextId: String(mainQuest.descTextMapHash),
    id: String(subQuest.subId),
    kind: QuestKind.World,
    offerTalkIds: [],
    steps: [
      {
        id: String(subQuest.subId),
        objectives: giving.exactItems.flatMap(({ count, id }) =>
          count === undefined || id === undefined
            ? []
            : [{ count, kind: QuestObjectiveKind.Collect, targetId: String(id) }],
        ),
        textId: String(subQuest.stepDescTextMapHash),
      },
    ],
    talks: [],
    titleTextId: String(mainQuest.titleTextMapHash),
  });
