import type { Context } from "#server/trpc/context";
import type { ResourceInResource, ResourcePublicationInResource } from "@esposter/db-schema";

import { getLiveSurveyWhere } from "#server/services/survey/getLiveSurveyWhere";
import { getNotFoundError } from "#server/trpc/guards/getNotFoundError";
import { getLivePublicationWhere } from "@esposter/db";
import { DatabaseEntityType, resourcePublicationsInResource } from "@esposter/db-schema";
import { eq } from "drizzle-orm";

// A survey in the Recycle bin accepts no response and reads none: deleting it kills its participant links immediately,
// Even though the row and blob survive for restore, so every response read and write resolves the survey through here
// The live publication rides along, since a write is checked against the snapshot the respondent was served
export const readLiveSurvey = async (
  db: Context["db"],
  surveyId: ResourceInResource["id"],
): Promise<{ publication: null | ResourcePublicationInResource } & ResourceInResource> => {
  const survey = await db.query.resourcesInResource.findFirst({ where: getLiveSurveyWhere(surveyId) });
  if (!survey) throw getNotFoundError(DatabaseEntityType.Resource, surveyId);
  const [publication] = await db
    .select()
    .from(resourcePublicationsInResource)
    .where(getLivePublicationWhere(eq(resourcePublicationsInResource.resourceId, surveyId)))
    .limit(1);
  return { ...survey, publication: publication ?? null };
};
