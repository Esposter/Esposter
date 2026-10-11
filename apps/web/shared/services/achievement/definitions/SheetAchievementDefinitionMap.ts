// @unocss-include
import { AchievementCategory } from "#shared/models/achievement/AchievementCategory";
import { createSaveResourceContentInputSchema } from "#shared/models/db/resource/SaveResourceContentInput";
import { isAtLeast } from "#shared/services/achievement/conditions/isAtLeast";
import { length } from "#shared/services/achievement/conditions/length";
import { property } from "#shared/services/achievement/conditions/property";
import { defineAchievementDefinition } from "#shared/services/achievement/definitions/defineAchievementDefinition";
import { defineAchievementDefinitionMap } from "#shared/services/achievement/definitions/defineAchievementDefinitionMap";
import { ResourceDefinitionMap } from "#shared/services/resource/ResourceDefinitionMap";
import { ResourceType, TableAchievementName } from "@esposter/db-schema";

export const SheetAchievementDefinitionMap = defineAchievementDefinitionMap(AchievementCategory.Table, {
  [TableAchievementName.DataAnalyst]: defineAchievementDefinition({
    amount: 1,
    description: "Save a file",
    icon: "i-mdi:table",
    inputSchema: createSaveResourceContentInputSchema(ResourceDefinitionMap[ResourceType.Sheet].contentSchema),
    points: 20,
    triggerPath: "sheet.saveResourceContent",
  }),
  [TableAchievementName.MathWhiz]: defineAchievementDefinition({
    amount: 1,
    condition: property("content.data.rows", length(isAtLeast(5))),
    description: "Create a table with at least 5 rows",
    icon: "i-mdi:calculator",
    inputSchema: createSaveResourceContentInputSchema(ResourceDefinitionMap[ResourceType.Sheet].contentSchema),
    points: 25,
    triggerPath: "sheet.saveResourceContent",
  }),
});
