// @unocss-include
import { AchievementCategory } from "#shared/models/achievement/AchievementCategory";
import { createSaveResourceContentInputSchema } from "#shared/models/db/resource/SaveResourceContentInput";
import { isAtLeast } from "#shared/services/achievement/conditions/isAtLeast";
import { length } from "#shared/services/achievement/conditions/length";
import { property } from "#shared/services/achievement/conditions/property";
import { defineTriggerAchievementDefinition } from "#shared/services/achievement/definitions/defineAchievementDefinition";
import { defineAchievementDefinitionMap } from "#shared/services/achievement/definitions/defineAchievementDefinitionMap";
import { ResourceDefinitionMap } from "#shared/services/resource/ResourceDefinitionMap";
import { ResourceType, TableAchievementName } from "@esposter/db-schema";

const defineSheetAchievementDefinition = defineTriggerAchievementDefinition(
  "sheet.saveResourceContent",
  createSaveResourceContentInputSchema(ResourceDefinitionMap[ResourceType.Sheet].contentSchema),
);

export const SheetAchievementDefinitionMap = defineAchievementDefinitionMap(AchievementCategory.Table, {
  [TableAchievementName.DataAnalyst]: defineSheetAchievementDefinition({
    amount: 1,
    description: "Save a file",
    icon: "i-mdi:table",
    points: 20,
  }),
  [TableAchievementName.MathWhiz]: defineSheetAchievementDefinition({
    amount: 1,
    condition: property("content.data.rows", length(isAtLeast(5))),
    description: "Create a table with at least 5 rows",
    icon: "i-mdi:calculator",
    points: 25,
  }),
});
