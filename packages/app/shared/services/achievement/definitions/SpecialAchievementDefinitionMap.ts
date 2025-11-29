import { AchievementCategory } from "#shared/models/achievement/AchievementCategory";
import { AchievementConditionType } from "#shared/models/achievement/AchievementConditionType";
import { defineAchievementDefinition } from "#shared/services/achievement/defineAchievementDefinition";
import { AchievementName } from "@esposter/db-schema";

export const SpecialAchievementDefinitionMap = {
  [AchievementName.Meta]: defineAchievementDefinition({
    category: AchievementCategory.Special,
    condition: {
      operator: "contains",
      path: "message",
      type: AchievementConditionType.Property,
      value: "achievement unlocked",
    },
    description: 'Send a message containing "achievement unlocked"',
    icon: "mdi-trophy",
    isHidden: true,
    points: 100,
    triggerPath: "message.createMessage" as const,
  }),
};
