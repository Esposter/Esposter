// @unocss-include
import { AchievementCategory } from "#shared/models/achievement/AchievementCategory";
import { createSaveResourceContentInputSchema } from "#shared/models/db/resource/SaveResourceContentInput";
import { defineAchievementDefinition } from "#shared/services/achievement/definitions/defineAchievementDefinition";
import { defineAchievementDefinitionMap } from "#shared/services/achievement/definitions/defineAchievementDefinitionMap";
import { ResourceDefinitionMap } from "#shared/services/resource/ResourceDefinitionMap";
import { ResourceType, WebpageAchievementName } from "@esposter/db-schema";

export const WebpageAchievementDefinitionMap = defineAchievementDefinitionMap(AchievementCategory.Webpage, {
  [WebpageAchievementName.WebDeveloper]: defineAchievementDefinition({
    amount: 1,
    description: "Save a webpage",
    icon: "i-mdi:web",
    inputSchema: createSaveResourceContentInputSchema(ResourceDefinitionMap[ResourceType.Webpage].contentSchema),
    points: 20,
    triggerPath: "webpage.saveResourceContent",
  }),
});
