import { ResourceType } from "@esposter/db-schema";
import { RoutePath } from "@esposter/shared";

// The link a participant answers the survey by: the survey's own page, carrying the credential as its `t` parameter
export const createParticipantLink = (origin: string, surveyId: string, token: string) =>
  `${origin}${RoutePath.View(ResourceType.Survey, surveyId)}?${new URLSearchParams({ t: token })}`;
