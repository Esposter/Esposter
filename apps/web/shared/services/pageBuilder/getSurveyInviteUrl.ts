import { ResourceType } from "@esposter/db-schema";
import { RoutePath } from "@esposter/shared";

// The absolute link to a published survey, against the origin the page or email is published from
export const getSurveyInviteUrl = (origin: string, surveyId: string): string =>
  `${origin}${RoutePath.View(ResourceType.Survey, surveyId)}`;
