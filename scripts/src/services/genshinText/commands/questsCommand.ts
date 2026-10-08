import type { SubCommandsDef } from "citty";

import { writeQuests } from "#src/services/genshinText/writeQuests";
import { defineCommand } from "citty";

export const questsCommand: SubCommandsDef[string] = defineCommand({
  meta: {
    description:
      "Write every quest QuestId names into the world: its steps, its talks and their words in every language",
    name: "quests",
  },
  run: () => {
    for (const note of writeQuests()) console.log(note);
  },
});
