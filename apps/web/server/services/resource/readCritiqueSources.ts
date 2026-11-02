import type { Context } from "#server/trpc/context";
import type { CritiqueSources } from "#shared/models/pageBuilder/CritiqueSources";
import type { WebpageDocument } from "#shared/models/pageBuilder/WebpageDocument";

import { getResourcesWhere } from "#server/services/resource/getResourcesWhere";
import { SurveyPublishState } from "#shared/models/pageBuilder/SurveyPublishState";
import { checkHasSurveyInvite } from "#shared/services/pageBuilder/critique/checkHasSurveyInvite";
import { ResourceType, resourcesInResource } from "@esposter/db-schema";
import { getResultAsync } from "@esposter/shared";

// What the critique reads from the server, which has no browser to read a colour in, so every colour is unchecked. A survey
// Is published when the owner has it published. Only a page holding an invite asks for a survey's state, so the owner's
// Surveys are read for that page alone. A lookup that fails answers unreadable for every survey, so each invite is
// Reported unchecked rather than dropped, and the failure is logged
export const readCritiqueSources = async (
  db: Context["db"],
  userId: string,
  document: WebpageDocument,
): Promise<CritiqueSources> => {
  const publishedSurveyIds = await getResultAsync(async () => {
    if (!checkHasSurveyInvite(document)) return [];

    const publishedSurveys = await db
      .select({ id: resourcesInResource.id })
      .from(resourcesInResource)
      .where(getResourcesWhere(db, userId, { isPublished: true, types: [ResourceType.Survey] }));
    return publishedSurveys.map(({ id }) => id);
  }).orTee(console.error);

  return {
    lookupSurveyPublishState: (surveyId) =>
      publishedSurveyIds.match(
        (ids) => (ids.includes(surveyId) ? SurveyPublishState.Published : SurveyPublishState.Unpublished),
        () => SurveyPublishState.Unreadable,
      ),
    readColor: () => undefined,
  };
};
