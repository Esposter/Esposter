import { AchievementCategory } from "#shared/models/achievement/AchievementCategory";
import { defineAchievementDefinition } from "#shared/services/achievement/defineAchievementDefinition";
import { ClickerAchievementName } from "@esposter/db-schema";

export const ClickerAchievementDefinitionMap = {
  [ClickerAchievementName.ClickerAddict]: defineAchievementDefinition({
    amount: 100,
    category: AchievementCategory.Clicker,
    description: "Save your clicker game 100 times",
    icon: "mdi-mouse-variant",
    points: 50,
    triggerPath: "clicker.saveClicker" as const,
  }),
  [ClickerAchievementName.ClickerNovice]: defineAchievementDefinition({
    amount: 1,
    category: AchievementCategory.Clicker,
    description: "Save your clicker game for the first time",
    icon: "mdi-mouse",
    points: 5,
    triggerPath: "clicker.saveClicker" as const,
  }),
  [ClickerAchievementName.ClickerPro]: defineAchievementDefinition({
    amount: 10,
    category: AchievementCategory.Clicker,
    description: "Save your clicker game 10 times",
    icon: "mdi-mouse-move-vertical",
    points: 20,
    triggerPath: "clicker.saveClicker" as const,
  }),
  [ClickerAchievementName.ClickerSaver]: defineAchievementDefinition({
    amount: 1,
    category: AchievementCategory.Clicker,
    description: "Save your clicker game",
    icon: "mdi-content-save",
    points: 10,
    triggerPath: "clicker.saveClicker" as const,
  }),
};
