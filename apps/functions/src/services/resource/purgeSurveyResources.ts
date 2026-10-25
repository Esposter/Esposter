import type { InvocationContext } from "@azure/functions";

import { getContainerClient } from "#src/services/azure/getContainerClient";
import { purgeResourceAndBroadcast } from "#src/services/resource/purgeResourceAndBroadcast";
import { removeSurveyInviteReferences } from "#src/services/resource/removeSurveyInviteReferences";
import { db } from "#src/services/shared/db";
import { AzureContainer, resourcesInResource, ResourceType } from "@esposter/db-schema";
import { getResultAsync, noop } from "@esposter/shared";
import { asc, eq } from "drizzle-orm";

// The one-time run before the survey type is removed: each survey resource is purged as the timer purges an expired one,
// then every invite naming a survey that is gone is removed from the webpages and emails holding it. A survey whose purge
// fails keeps its row, and the invites naming it keep their links, so a rerun finds exactly what is left. It is a
// deletion only: nothing is counted and no stored survey is converted
export const purgeSurveyResources = async (context: InvocationContext): Promise<void> => {
  const surveys = await db
    .select()
    .from(resourcesInResource)
    .where(eq(resourcesInResource.type, ResourceType.Survey))
    .orderBy(asc(resourcesInResource.createdAt));
  const containerClient = await getContainerClient(AzureContainer.ResourceAssets);
  // Per-survey, so one failing purge cannot stop the rest of the run; its row survives for the rerun
  for (const survey of surveys)
    // oxlint-disable-next-line no-await-in-loop -- Bounded concurrency: one survey at a time, as the timer's purge runs
    await getResultAsync(() => purgeResourceAndBroadcast(context, containerClient, survey)).match(noop, (error) => {
      context.error(`Failed to purge survey ${survey.id}: `, error);
    });

  await removeSurveyInviteReferences(context, containerClient);
};
