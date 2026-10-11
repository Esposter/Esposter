// @unocss-include
import { AchievementCategory } from "#shared/models/achievement/AchievementCategory";
import { defineAchievementDefinition } from "#shared/services/achievement/definitions/defineAchievementDefinition";
import { defineAchievementDefinitionMap } from "#shared/services/achievement/definitions/defineAchievementDefinitionMap";
import { TableAchievementName, ResourceType } from "@esposter/db-schema";
import { ResourceDefinitionMap } from "#shared/services/resource/ResourceDefinitionMap";
import { createSaveResourceContentInputSchema } from "#shared/models/db/resource/SaveResourceContentInput";
import { isAtLeast } from "#shared/services/achievement/conditions/isAtLeast";
import { length } from "#shared/services/achievement/conditions/length";
import { property } from "#shared/services/achievement/conditions/property";

export const SheetAchievementDefinitionMap = defineAchievementDefinitionMap(AchievementCategory.Table, {
  [TableAchievementName.DataAnalyst]: defineAchievementDefinition({
    amount: 1,
    description: "Save a file",
    icon: "i-mdi:table",
    points: 20,
    inputSchema: createSaveResourceContentInputSchema(ResourceDefinitionMap[ResourceType.Sheet].contentSchema),
    triggerPath: "sheet.saveResourceContent",
  }),
  [TableAchievementName.MathWhiz]: defineAchievementDefinition({
    amount: 1,
    condition: property("content.data.rows", length(isAtLeast(5))),
    description: "Create a table with at least 5 rows",
    icon: "i-mdi:calculator",
    points: 25,
    inputSchema: createSaveResourceContentInputSchema(ResourceDefinitionMap[ResourceType.Sheet].contentSchema),
    triggerPath: "sheet.saveResourceContent",
  }),
});
