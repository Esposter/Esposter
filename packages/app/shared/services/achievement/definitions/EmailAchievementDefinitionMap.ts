import { AchievementCategory } from "#shared/models/achievement/AchievementCategory";
import { defineAchievementDefinition } from "#shared/services/achievement/defineAchievementDefinition";
import { AchievementName } from "@esposter/db-schema";

export const EmailAchievementDefinitionMap = {
  [AchievementName.EmailMarketer]: defineAchievementDefinition({
    amount: 1,
    category: AchievementCategory.Email,
    description: "Save an email template",
    icon: "mdi-email-edit",
    points: 20,
    triggerPath: "emailEditor.saveEmailEditor" as const,
  }),
};
