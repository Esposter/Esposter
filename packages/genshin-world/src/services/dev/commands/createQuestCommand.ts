import type { DevCommand } from "#src/models/dev/DevCommand";
import type { Quest } from "#src/models/quest/Quest";
import type { QuestProgress } from "#src/models/quest/QuestProgress";

import { checkIsQuestFinished } from "#src/services/quest/checkIsQuestFinished";
import { z } from "zod";

const questArgs = z.object({ id: z.string().min(1) });

// `quest <id>` answers how far a quest stands in the quests store's progress, read against the quest's own steps: `not
// Started` when no progress holds it, `finished` once its last step is past, and else `step k of n`, the step it is on
export const createQuestCommand = ({
  getQuestProgressMap,
  getQuests,
}: {
  getQuestProgressMap: () => ReadonlyMap<string, QuestProgress>;
  getQuests: () => readonly Quest[];
}): DevCommand<typeof questArgs> => ({
  args: questArgs,
  argumentNames: ["id"],
  name: "quest",
  run: ({ id }) => {
    const quest = getQuests().find((candidate) => candidate.id === id);
    if (!quest) return { error: `unknown quest ${id}`, ok: false };

    const progress = getQuestProgressMap().get(id);
    if (!progress) return { ok: true, value: "not started" };
    if (checkIsQuestFinished(quest, progress)) return { ok: true, value: "finished" };
    return { ok: true, value: `step ${progress.stepIndex + 1} of ${quest.steps.length}` };
  },
});
