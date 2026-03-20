import { AchievementCategory } from "#shared/models/achievement/AchievementCategory";
import { AchievementConditionType } from "#shared/models/achievement/type/AchievementConditionType";
import { TableEditorType } from "#shared/models/tableEditor/data/TableEditorType";
import { defineAchievementDefinition } from "#shared/services/achievement/defineAchievementDefinition";
import { BinaryOperator, TableAchievementName } from "@esposter/db-schema";

export const TableAchievementDefinitionMap = {
  [TableAchievementName.DataAnalyst]: defineAchievementDefinition({
    amount: 1,
    category: AchievementCategory.Table,
    description: "Save a table configuration",
    icon: "mdi-table",
    points: 20,
    triggerPath: "tableEditor.saveTableEditorConfiguration" as const,
  }),
  [TableAchievementName.MathWhiz]: defineAchievementDefinition({
    amount: 1,
    category: AchievementCategory.Table,
    condition: {
      conditions: Object.values(TableEditorType).map((tableEditorType) => ({
        operator: BinaryOperator.ge,
        path: `${tableEditorType}.items.length` as const,
        type: AchievementConditionType.Property,
        value: 5,
      })),
      type: AchievementConditionType.Or,
    },
    description: "Create a table with at least 5 rows",
    icon: "mdi-calculator",
    points: 25,
    triggerPath: "tableEditor.saveTableEditorConfiguration" as const,
  }),
};
