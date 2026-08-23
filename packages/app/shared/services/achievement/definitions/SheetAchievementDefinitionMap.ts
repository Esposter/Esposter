import { AchievementCategory } from "#shared/models/achievement/AchievementCategory";
import { AchievementConditionType } from "#shared/models/achievement/type/AchievementConditionType";
import { defineAchievementDefinition } from "#shared/services/achievement/defineAchievementDefinition";
import { defineAchievementDefinitionMap } from "#shared/services/achievement/defineAchievementDefinitionMap";
import { BinaryOperator } from "@esposter/azure";
import { TableAchievementName } from "@esposter/db-schema";

export const SheetAchievementDefinitionMap = defineAchievementDefinitionMap(AchievementCategory.Table, {
  [TableAchievementName.DataAnalyst]: defineAchievementDefinition({
    amount: 1,
    description: "Save a file",
    icon: "mdi-table",
    points: 20,
    triggerPath: "sheet.saveResourceContent" as const,
  }),
  [TableAchievementName.MathWhiz]: defineAchievementDefinition({
    amount: 1,
    condition: {
      operator: BinaryOperator.ge,
      path: "content.data.rows.length" as const,
      type: AchievementConditionType.Property,
      value: 5,
    },
    description: "Create a table with at least 5 rows",
    icon: "mdi-calculator",
    points: 25,
    triggerPath: "sheet.saveResourceContent" as const,
  }),
});
