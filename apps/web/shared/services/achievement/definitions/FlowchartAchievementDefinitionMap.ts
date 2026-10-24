// @unocss-include
import { AchievementCategory } from "#shared/models/achievement/AchievementCategory";
import { createSaveResourceContentInputSchema } from "#shared/models/db/resource/SaveResourceContentInput";
import { isGreaterThan } from "#shared/services/achievement/conditions/isGreaterThan";
import { length } from "#shared/services/achievement/conditions/length";
import { property } from "#shared/services/achievement/conditions/property";
import { defineTriggerAchievementDefinition } from "#shared/services/achievement/definitions/defineAchievementDefinition";
import { defineAchievementDefinitionMap } from "#shared/services/achievement/definitions/defineAchievementDefinitionMap";
import { ResourceDefinitionMap } from "#shared/services/resource/ResourceDefinitionMap";
import { FlowchartAchievementName, ResourceType } from "@esposter/db-schema";

const saveFlowchartInputSchema = createSaveResourceContentInputSchema(
  ResourceDefinitionMap[ResourceType.Flowchart].contentSchema,
);
const defineFlowchartAchievementDefinition = defineTriggerAchievementDefinition(
  "flowchart.saveResourceContent",
  saveFlowchartInputSchema,
);

export const FlowchartAchievementDefinitionMap = defineAchievementDefinitionMap(AchievementCategory.Flowchart, {
  [FlowchartAchievementName.ComplexFlow]: defineFlowchartAchievementDefinition({
    amount: 1,
    condition: property("content.edges", length(isGreaterThan(20))),
    description: "Save a flowchart with more than 20 edges",
    icon: "i-mdi:chart-timeline-variant-shimmer",
    points: 40,
  }),
  [FlowchartAchievementName.Flowcharter]: defineFlowchartAchievementDefinition({
    amount: 1,
    description: "Save a flowchart",
    icon: "i-mdi:chart-timeline-variant",
    points: 20,
  }),
  [FlowchartAchievementName.SystemArchitect]: defineFlowchartAchievementDefinition({
    amount: 1,
    condition: property("content.nodes", length(isGreaterThan(10))),
    description: "Save a flowchart with more than 10 nodes",
    icon: "i-mdi:sitemap",
    points: 30,
  }),
});
