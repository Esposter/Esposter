import type { InvocationContext } from "@azure/functions";

import { purgeExpiredResources } from "#src/services/resource/purgeExpiredResources";
import { db } from "#src/services/shared/db";
import { ResourceType, resourcesInResource } from "@esposter/db-schema";
import { and, inArray, lt } from "drizzle-orm";

// The cutover's one-time run: the timer's purge, then a count of the Email and Webpage rows created before the cutover
// that are still there. The migration bins each of them past retention, so the purge reaches every one, and zero is the
// confirmation that each directory, partition and ledger entry went before its row
export const purgePreCutoverResources = async (context: InvocationContext, cutoff: Date): Promise<number> => {
  await purgeExpiredResources(context);
  return db.$count(
    resourcesInResource,
    and(
      inArray(resourcesInResource.type, [ResourceType.Email, ResourceType.Webpage]),
      lt(resourcesInResource.createdAt, cutoff),
    ),
  );
};
