import { AchievementCategory } from "#shared/models/achievement/AchievementCategory";
import { defineAchievementDefinition } from "#shared/services/achievement/defineAchievementDefinition";
import { FlowchartAchievementName } from "@esposter/db-schema";

export const FlowchartAchievementDefinitionMap = {
  [FlowchartAchievementName.Flowcharter]: defineAchievementDefinition({
    amount: 1,
    category: AchievementCategory.Flowchart,
    description: "Save a flowchart",
    icon: "mdi-chart-timeline-variant",
    points: 20,
    triggerPath: "flowchartEditor.saveFlowchartEditor" as const,
  }),
};
