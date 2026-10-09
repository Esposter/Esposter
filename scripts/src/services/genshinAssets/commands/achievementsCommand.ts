import type { SubCommandsDef } from "citty";

import { writeAchievements } from "#src/services/genshinAssets/achievements/writeAchievements";
import { writeAchievementText } from "#src/services/genshinAssets/achievements/writeAchievementText";
import { defineCommand } from "citty";

export const achievementsCommand: SubCommandsDef[string] = defineCommand({
  meta: {
    description:
      "Write the achievements, their categories and every title and description in every language from the dump into genshin-world",
    name: "achievements",
  },
  run: () => {
    writeAchievements();
    for (const note of writeAchievementText()) console.log(note);
  },
});
