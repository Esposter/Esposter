import { AchievementCategory } from "#shared/models/achievement/AchievementCategory";
import { defineAchievementDefinition } from "#shared/services/achievement/defineAchievementDefinition";
import { WebpageAchievementName } from "@esposter/db-schema";

export const WebpageAchievementDefinitionMap = {
  [WebpageAchievementName.WebDeveloper]: defineAchievementDefinition({
    amount: 1,
    category: AchievementCategory.Webpage,
    description: "Save a webpage",
    icon: "mdi-web",
    points: 20,
    triggerPath: "webpageEditor.saveWebpageEditor" as const,
  }),
};
