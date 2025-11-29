import { AchievementCategory } from "#shared/models/achievement/AchievementCategory";
import { defineAchievementDefinition } from "#shared/services/achievement/defineAchievementDefinition";
import { TableAchievementName } from "@esposter/db-schema";

export const TableAchievementDefinitionMap = {
  [TableAchievementName.DataAnalyst]: defineAchievementDefinition({
    amount: 1,
    category: AchievementCategory.Table,
    description: "Save a table configuration",
    icon: "mdi-table",
    points: 20,
    triggerPath: "tableEditor.saveTableEditorConfiguration" as const,
  }),
};
