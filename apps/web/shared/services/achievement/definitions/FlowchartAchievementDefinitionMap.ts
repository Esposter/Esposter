// @unocss-include
import { AchievementCategory } from "#shared/models/achievement/AchievementCategory";
import { createSaveResourceContentInputSchema } from "#shared/models/db/resource/SaveResourceContentInput";
import { isGreaterThan } from "#shared/services/achievement/conditions/isGreaterThan";
import { length } from "#shared/services/achievement/conditions/length";
import { property } from "#shared/services/achievement/conditions/property";
import { defineAchievementDefinition } from "#shared/services/achievement/definitions/defineAchievementDefinition";
import { defineAchievementDefinitionMap } from "#shared/services/achievement/definitions/defineAchievementDefinitionMap";
import { ResourceDefinitionMap } from "#shared/services/resource/ResourceDefinitionMap";
import { FlowchartAchievementName, ResourceType } from "@esposter/db-schema";

export const FlowchartAchievementDefinitionMap = defineAchievementDefinitionMap(AchievementCategory.Flowchart, {
  [FlowchartAchievementName.ComplexFlow]: defineAchievementDefinition({
    amount: 1,
    condition: property("content.edges", length(isGreaterThan(20))),
    description: "Save a flowchart with more than 20 edges",
    icon: "i-mdi:chart-timeline-variant-shimmer",
    inputSchema: createSaveResourceContentInputSchema(ResourceDefinitionMap[ResourceType.Flowchart].contentSchema),
    points: 40,
    triggerPath: "flowchart.saveResourceContent",
  }),
  [FlowchartAchievementName.Flowcharter]: defineAchievementDefinition({
    amount: 1,
    description: "Save a flowchart",
    icon: "i-mdi:chart-timeline-variant",
    inputSchema: createSaveResourceContentInputSchema(ResourceDefinitionMap[ResourceType.Flowchart].contentSchema),
    points: 20,
    triggerPath: "flowchart.saveResourceContent",
  }),
  [FlowchartAchievementName.SystemArchitect]: defineAchievementDefinition({
    amount: 1,
    condition: property("content.nodes", length(isGreaterThan(10))),
    description: "Save a flowchart with more than 10 nodes",
    icon: "i-mdi:sitemap",
    inputSchema: createSaveResourceContentInputSchema(ResourceDefinitionMap[ResourceType.Flowchart].contentSchema),
    points: 30,
    triggerPath: "flowchart.saveResourceContent",
  }),
});
