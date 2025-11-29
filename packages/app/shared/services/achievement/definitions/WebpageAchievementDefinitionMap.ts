import { AchievementCategory } from "#shared/models/achievement/AchievementCategory";
import { defineAchievementDefinition } from "#shared/services/achievement/defineAchievementDefinition";
import { AchievementName } from "@esposter/db-schema";

export const WebpageAchievementDefinitionMap = {
  [AchievementName.WebDeveloper]: defineAchievementDefinition({
    amount: 1,
    category: AchievementCategory.Webpage,
    description: "Save a webpage",
    icon: "mdi-web",
    points: 20,
    triggerPath: "webpageEditor.saveWebpageEditor" as const,
  }),
};
