import type { Context } from "#server/trpc/context";
import type { SQLWrapper } from "drizzle-orm";

import { getLivePublicationWhere } from "@esposter/db";
import { resourcePublicationsInResource } from "@esposter/db-schema";
import { eq, exists, notExists } from "drizzle-orm";

// A live publication row exists iff the resource is currently published, so both states are a row check on the resource
export const getPublicationWhere = (db: Context["db"], resourceId: SQLWrapper, isPublished: boolean) => {
  const publicationQuery = db
    .select()
    .from(resourcePublicationsInResource)
    .where(getLivePublicationWhere(eq(resourcePublicationsInResource.resourceId, resourceId)));
  return isPublished ? exists(publicationQuery) : notExists(publicationQuery);
};
