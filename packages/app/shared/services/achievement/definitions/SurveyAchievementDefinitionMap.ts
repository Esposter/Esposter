import { AchievementCategory } from "#shared/models/achievement/AchievementCategory";
import { defineAchievementDefinition } from "#shared/services/achievement/defineAchievementDefinition";
import { defineAchievementDefinitionMap } from "#shared/services/achievement/defineAchievementDefinitionMap";
import { SurveyAchievementName } from "@esposter/db-schema";

export const SurveyAchievementDefinitionMap = defineAchievementDefinitionMap(AchievementCategory.Survey, {
  [SurveyAchievementName.DataCollector]: defineAchievementDefinition({
    amount: 100,
    description: "Receive 100 survey responses",
    icon: "mdi-database",
    points: 150,
    triggerPath: "survey.createSurveyResponse" as const,
  }),
  [SurveyAchievementName.Modeler]: defineAchievementDefinition({
    amount: 1,
    description: "Update a survey model",
    icon: "mdi-form-select",
    points: 15,
    triggerPath: "survey.saveResourceContent" as const,
  }),
  [SurveyAchievementName.Publisher]: defineAchievementDefinition({
    amount: 1,
    description: "Publish a survey",
    icon: "mdi-publish",
    points: 25,
    triggerPath: "survey.publishResource" as const,
  }),
  [SurveyAchievementName.Respondent]: defineAchievementDefinition({
    amount: 1,
    description: "Respond to a survey",
    icon: "mdi-clipboard-check",
    points: 10,
    triggerPath: "survey.createSurveyResponse" as const,
  }),
  [SurveyAchievementName.ResponseEditor]: defineAchievementDefinition({
    amount: 1,
    description: "Edit a survey response",
    icon: "mdi-clipboard-edit",
    points: 5,
    triggerPath: "survey.updateSurveyResponse" as const,
  }),
  [SurveyAchievementName.SurveyDeleter]: defineAchievementDefinition({
    amount: 1,
    description: "Delete a survey",
    icon: "mdi-delete-sweep",
    points: 5,
    triggerPath: "survey.deleteResource" as const,
  }),
  [SurveyAchievementName.SurveyEditor]: defineAchievementDefinition({
    amount: 1,
    description: "Edit a survey",
    icon: "mdi-file-document-edit",
    points: 5,
    triggerPath: "survey.updateResource" as const,
  }),
  [SurveyAchievementName.SurveyGuru]: defineAchievementDefinition({
    amount: 50,
    description: "Publish 50 surveys",
    icon: "mdi-trophy-variant",
    points: 200,
    triggerPath: "survey.publishResource" as const,
  }),
  [SurveyAchievementName.Surveyor]: defineAchievementDefinition({
    amount: 1,
    description: "Create a survey",
    icon: "mdi-poll",
    points: 15,
    triggerPath: "survey.createResource" as const,
  }),
  [SurveyAchievementName.SurveySays]: defineAchievementDefinition({
    amount: 10,
    description: "Create 10 surveys",
    icon: "mdi-clipboard-list",
    points: 50,
    triggerPath: "survey.createResource" as const,
  }),
});
