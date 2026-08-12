import { AchievementCategory } from "#shared/models/achievement/AchievementCategory";
import { defineAchievementDefinition } from "#shared/services/achievement/defineAchievementDefinition";
import { defineAchievementDefinitionMap } from "#shared/services/achievement/defineAchievementDefinitionMap";
import { EmailAchievementName } from "@esposter/db-schema";

export const EmailAchievementDefinitionMap = defineAchievementDefinitionMap(AchievementCategory.Email, {
  [EmailAchievementName.EmailMarketer]: defineAchievementDefinition({
    amount: 1,
    description: "Save an email template",
    icon: "mdi-email-edit",
    points: 20,
    triggerPath: "email.saveResourceContent" as const,
  }),
});
