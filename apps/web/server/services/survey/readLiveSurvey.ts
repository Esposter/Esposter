import type { Context } from "#server/trpc/context";
import type { ResourceInResource } from "@esposter/db-schema";

import { getNotFoundError } from "#server/trpc/guards/getNotFoundError";
import { DatabaseEntityType, ResourceType } from "@esposter/db-schema";

// A survey in the Recycle bin accepts no response and reads none: deleting it kills its participant links immediately,
// Even though the row and blob survive for restore, so every response read and write resolves the survey through here
export const readLiveSurvey = async (
  db: Context["db"],
  surveyId: ResourceInResource["id"],
): Promise<ResourceInResource> => {
  const survey = await db.query.resourcesInResource.findFirst({
    where: { deletedAt: { isNull: true }, id: { eq: surveyId }, type: { eq: ResourceType.Survey } },
  });
  if (!survey) throw getNotFoundError(DatabaseEntityType.Resource, surveyId);
  return survey;
};
