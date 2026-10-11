// @unocss-include
import { AchievementCategory } from "#shared/models/achievement/AchievementCategory";
import { defineAchievementDefinition } from "#shared/services/achievement/definitions/defineAchievementDefinition";
import { defineAchievementDefinitionMap } from "#shared/services/achievement/definitions/defineAchievementDefinitionMap";
import { EmailAchievementName, ResourceType } from "@esposter/db-schema";
import { ResourceDefinitionMap } from "#shared/services/resource/ResourceDefinitionMap";
import { createSaveResourceContentInputSchema } from "#shared/models/db/resource/SaveResourceContentInput";

export const EmailAchievementDefinitionMap = defineAchievementDefinitionMap(AchievementCategory.Email, {
  [EmailAchievementName.EmailMarketer]: defineAchievementDefinition({
    amount: 1,
    description: "Save an email template",
    icon: "i-mdi:email-edit",
    points: 20,
    inputSchema: createSaveResourceContentInputSchema(ResourceDefinitionMap[ResourceType.Email].contentSchema),
    triggerPath: "email.saveResourceContent",
  }),
});
