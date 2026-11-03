import type { Context } from "#server/trpc/context";
import type { ResourceInResource, ResourcePublicationInResource } from "@esposter/db-schema";

import { getNotFoundError } from "#server/trpc/guards/getNotFoundError";
import { DatabaseEntityType, ResourceType } from "@esposter/db-schema";

// A survey in the Recycle bin accepts no response and reads none: deleting it kills its participant links immediately,
// Even though the row and blob survive for restore, so every response read and write resolves the survey through here
// The publication rides along, since a write is checked against the snapshot the respondent was served
export const readLiveSurvey = async (
  db: Context["db"],
  surveyId: ResourceInResource["id"],
): Promise<ResourceInResource & { publication: null | ResourcePublicationInResource }> => {
  const survey = await db.query.resourcesInResource.findFirst({
    where: { deletedAt: { isNull: true }, id: { eq: surveyId }, type: { eq: ResourceType.Survey } },
    with: { publication: true },
  });
  if (!survey) throw getNotFoundError(DatabaseEntityType.Resource, surveyId);
  return survey;
};
