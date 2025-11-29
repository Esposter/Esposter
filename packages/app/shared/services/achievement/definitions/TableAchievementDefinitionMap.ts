import { AchievementCategory } from "#shared/models/achievement/AchievementCategory";
import { defineAchievementDefinition } from "#shared/services/achievement/defineAchievementDefinition";
import { AchievementName } from "@esposter/db-schema";

export const TableAchievementDefinitionMap = {
  [AchievementName.DataAnalyst]: defineAchievementDefinition({
    amount: 1,
    category: AchievementCategory.Table,
    description: "Save a table configuration",
    icon: "mdi-table",
    points: 20,
    triggerPath: "tableEditor.saveTableEditorConfiguration" as const,
  }),
};
