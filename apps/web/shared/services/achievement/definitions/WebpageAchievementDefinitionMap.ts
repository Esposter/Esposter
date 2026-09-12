import { AchievementCategory } from "#shared/models/achievement/AchievementCategory";
import { defineAchievementDefinition } from "#shared/services/achievement/definitions/defineAchievementDefinition";
import { defineAchievementDefinitionMap } from "#shared/services/achievement/definitions/defineAchievementDefinitionMap";
import { WebpageAchievementName } from "@esposter/db-schema";

export const WebpageAchievementDefinitionMap = defineAchievementDefinitionMap(AchievementCategory.Webpage, {
  [WebpageAchievementName.WebDeveloper]: defineAchievementDefinition({
    amount: 1,
    description: "Save a webpage",
    icon: "mdi-web",
    points: 20,
    triggerPath: "webpage.saveResourceContent",
  }),
});
