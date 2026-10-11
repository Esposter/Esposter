// @unocss-include
import { AchievementCategory } from "#shared/models/achievement/AchievementCategory";
import { createSaveResourceContentInputSchema } from "#shared/models/db/resource/SaveResourceContentInput";
import { defineAchievementDefinition } from "#shared/services/achievement/definitions/defineAchievementDefinition";
import { defineAchievementDefinitionMap } from "#shared/services/achievement/definitions/defineAchievementDefinitionMap";
import { ResourceDefinitionMap } from "#shared/services/resource/ResourceDefinitionMap";
import { EmailAchievementName, ResourceType } from "@esposter/db-schema";

export const EmailAchievementDefinitionMap = defineAchievementDefinitionMap(AchievementCategory.Email, {
  [EmailAchievementName.EmailMarketer]: defineAchievementDefinition({
    amount: 1,
    description: "Save an email template",
    icon: "i-mdi:email-edit",
    inputSchema: createSaveResourceContentInputSchema(ResourceDefinitionMap[ResourceType.Email].contentSchema),
    points: 20,
    triggerPath: "email.saveResourceContent",
  }),
});
