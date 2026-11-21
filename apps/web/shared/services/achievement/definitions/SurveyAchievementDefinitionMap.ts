// @unocss-include
import { AchievementCategory } from "#shared/models/achievement/AchievementCategory";
import { createResourceInputSchema } from "#shared/models/db/resource/CreateResourceInput";
import { resourceIdInputSchema } from "#shared/models/db/resource/ResourceIdInput";
import { createSaveResourceContentInputSchema } from "#shared/models/db/resource/SaveResourceContentInput";
import { updateResourceInputSchema } from "#shared/models/db/resource/UpdateResourceInput";
import { createSurveyResponseInputSchema } from "#shared/models/db/survey/CreateSurveyResponseInput";
import { updateSurveyResponseInputSchema } from "#shared/models/db/survey/UpdateSurveyResponseInput";
import {
  defineAchievementDefinition,
  defineTriggerAchievementDefinition,
} from "#shared/services/achievement/definitions/defineAchievementDefinition";
import { defineAchievementDefinitionMap } from "#shared/services/achievement/definitions/defineAchievementDefinitionMap";
import { ResourceDefinitionMap } from "#shared/services/resource/ResourceDefinitionMap";
import { ResourceType, SurveyAchievementName } from "@esposter/db-schema";

const defineCreateSurveyResponseAchievementDefinition = defineTriggerAchievementDefinition(
  "survey.createSurveyResponse",
  createSurveyResponseInputSchema,
);

const definePublishResourceAchievementDefinition = defineTriggerAchievementDefinition(
  "survey.publishResource",
  resourceIdInputSchema,
);

const defineCreateResourceAchievementDefinition = defineTriggerAchievementDefinition(
  "survey.createResource",
  createResourceInputSchema,
);

export const SurveyAchievementDefinitionMap = defineAchievementDefinitionMap(AchievementCategory.Survey, {
  [SurveyAchievementName.DataCollector]: defineCreateSurveyResponseAchievementDefinition({
    amount: 100,
    description: "Receive 100 survey responses",
    icon: "i-mdi:database",
    points: 150,
  }),
  [SurveyAchievementName.Modeler]: defineAchievementDefinition({
    amount: 1,
    description: "Update a survey model",
    icon: "i-mdi:form-select",
    inputSchema: createSaveResourceContentInputSchema(ResourceDefinitionMap[ResourceType.Survey].contentSchema),
    points: 15,
    triggerPath: "survey.saveResourceContent",
  }),
  [SurveyAchievementName.Publisher]: definePublishResourceAchievementDefinition({
    amount: 1,
    description: "Publish a survey",
    icon: "i-mdi:publish",
    points: 25,
  }),
  [SurveyAchievementName.Respondent]: defineCreateSurveyResponseAchievementDefinition({
    amount: 1,
    description: "Respond to a survey",
    icon: "i-mdi:clipboard-check",
    points: 10,
  }),
  [SurveyAchievementName.ResponseEditor]: defineAchievementDefinition({
    amount: 1,
    description: "Edit a survey response",
    icon: "i-mdi:clipboard-edit",
    inputSchema: updateSurveyResponseInputSchema,
    points: 5,
    triggerPath: "survey.updateSurveyResponse",
  }),
  [SurveyAchievementName.SurveyDeleter]: defineAchievementDefinition({
    amount: 1,
    description: "Delete a survey",
    icon: "i-mdi:delete-sweep",
    inputSchema: resourceIdInputSchema,
    points: 5,
    triggerPath: "survey.deleteResource",
  }),
  [SurveyAchievementName.SurveyEditor]: defineAchievementDefinition({
    amount: 1,
    description: "Edit a survey",
    icon: "i-mdi:file-document-edit",
    inputSchema: updateResourceInputSchema,
    points: 5,
    triggerPath: "survey.updateResource",
  }),
  [SurveyAchievementName.SurveyGuru]: definePublishResourceAchievementDefinition({
    amount: 50,
    description: "Publish 50 surveys",
    icon: "i-mdi:trophy-variant",
    points: 200,
  }),
  [SurveyAchievementName.Surveyor]: defineCreateResourceAchievementDefinition({
    amount: 1,
    description: "Create a survey",
    icon: "i-mdi:poll",
    points: 15,
  }),
  [SurveyAchievementName.SurveySays]: defineCreateResourceAchievementDefinition({
    amount: 10,
    description: "Create 10 surveys",
    icon: "i-mdi:clipboard-list",
    points: 50,
  }),
});
