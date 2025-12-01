import { AchievementCategory } from "#shared/models/achievement/AchievementCategory";
import { AchievementConditionType } from "#shared/models/achievement/type/AchievementConditionType";
import { defineAchievementDefinition } from "#shared/services/achievement/defineAchievementDefinition";
import { BinaryOperator, FlowchartAchievementName } from "@esposter/db-schema";

export const FlowchartAchievementDefinitionMap = {
  [FlowchartAchievementName.Flowcharter]: defineAchievementDefinition({
    amount: 1,
    category: AchievementCategory.Flowchart,
    description: "Save a flowchart",
    icon: "mdi-chart-timeline-variant",
    points: 20,
    triggerPath: "flowchartEditor.saveFlowchartEditor" as const,
  }),
  [FlowchartAchievementName.SystemArchitect]: defineAchievementDefinition({
    amount: 1,
    category: AchievementCategory.Flowchart,
    condition: {
      operator: BinaryOperator.gt,
      path: "nodes.length",
      type: AchievementConditionType.Property,
      value: 10,
    },
    description: "Save a flowchart with more than 10 nodes",
    icon: "mdi-sitemap",
    points: 30,
    triggerPath: "flowchartEditor.saveFlowchartEditor" as const,
  }),
};
