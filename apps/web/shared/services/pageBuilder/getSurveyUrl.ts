import { ResourceType } from "@esposter/db-schema";
import { RoutePath } from "@esposter/shared";

export const getSurveyUrl = (baseUrl: string, surveyId: string) =>
  `${baseUrl}${RoutePath.View(ResourceType.Survey, surveyId)}`;
