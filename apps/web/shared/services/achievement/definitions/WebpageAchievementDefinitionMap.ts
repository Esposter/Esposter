// @unocss-include
import { AchievementCategory } from "#shared/models/achievement/AchievementCategory";
import { defineAchievementDefinition } from "#shared/services/achievement/definitions/defineAchievementDefinition";
import { defineAchievementDefinitionMap } from "#shared/services/achievement/definitions/defineAchievementDefinitionMap";
import { WebpageAchievementName, ResourceType } from "@esposter/db-schema";
import { ResourceDefinitionMap } from "#shared/services/resource/ResourceDefinitionMap";
import { createSaveResourceContentInputSchema } from "#shared/models/db/resource/SaveResourceContentInput";

export const WebpageAchievementDefinitionMap = defineAchievementDefinitionMap(AchievementCategory.Webpage, {
  [WebpageAchievementName.WebDeveloper]: defineAchievementDefinition({
    amount: 1,
    description: "Save a webpage",
    icon: "i-mdi:web",
    points: 20,
    inputSchema: createSaveResourceContentInputSchema(ResourceDefinitionMap[ResourceType.Webpage].contentSchema),
    triggerPath: "webpage.saveResourceContent",
  }),
});
