// @unocss-include
import { AchievementCategory } from "#shared/models/achievement/AchievementCategory";
import { defineAchievementDefinition } from "#shared/services/achievement/definitions/defineAchievementDefinition";
import { defineAchievementDefinitionMap } from "#shared/services/achievement/definitions/defineAchievementDefinitionMap";
import { SurveyAchievementName } from "@esposter/db-schema";

export const SurveyAchievementDefinitionMap = defineAchievementDefinitionMap(AchievementCategory.Survey, {
  [SurveyAchievementName.DataCollector]: defineAchievementDefinition({
    amount: 100,
    description: "Receive 100 survey responses",
    icon: "i-mdi:database",
    points: 150,
    triggerPath: "survey.createSurveyResponse",
  }),
  [SurveyAchievementName.Modeler]: defineAchievementDefinition({
    amount: 1,
    description: "Update a survey model",
    icon: "i-mdi:form-select",
    points: 15,
    triggerPath: "survey.saveResourceContent",
  }),
  [SurveyAchievementName.Publisher]: defineAchievementDefinition({
    amount: 1,
    description: "Publish a survey",
    icon: "i-mdi:publish",
    points: 25,
    triggerPath: "survey.publishResource",
  }),
  [SurveyAchievementName.Respondent]: defineAchievementDefinition({
    amount: 1,
    description: "Respond to a survey",
    icon: "i-mdi:clipboard-check",
    points: 10,
    triggerPath: "survey.createSurveyResponse",
  }),
  [SurveyAchievementName.ResponseEditor]: defineAchievementDefinition({
    amount: 1,
    description: "Edit a survey response",
    icon: "i-mdi:clipboard-edit",
    points: 5,
    triggerPath: "survey.updateSurveyResponse",
  }),
  [SurveyAchievementName.SurveyDeleter]: defineAchievementDefinition({
    amount: 1,
    description: "Delete a survey",
    icon: "i-mdi:delete-sweep",
    points: 5,
    triggerPath: "survey.deleteResource",
  }),
  [SurveyAchievementName.SurveyEditor]: defineAchievementDefinition({
    amount: 1,
    description: "Edit a survey",
    icon: "i-mdi:file-document-edit",
    points: 5,
    triggerPath: "survey.updateResource",
  }),
  [SurveyAchievementName.SurveyGuru]: defineAchievementDefinition({
    amount: 50,
    description: "Publish 50 surveys",
    icon: "i-mdi:trophy-variant",
    points: 200,
    triggerPath: "survey.publishResource",
  }),
  [SurveyAchievementName.Surveyor]: defineAchievementDefinition({
    amount: 1,
    description: "Create a survey",
    icon: "i-mdi:poll",
    points: 15,
    triggerPath: "survey.createResource",
  }),
  [SurveyAchievementName.SurveySays]: defineAchievementDefinition({
    amount: 10,
    description: "Create 10 surveys",
    icon: "i-mdi:clipboard-list",
    points: 50,
    triggerPath: "survey.createResource",
  }),
});
