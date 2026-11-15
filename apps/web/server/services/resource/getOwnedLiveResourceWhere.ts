import type { ResourceInResource } from "@esposter/db-schema";

import { ownedBy } from "#server/services/db/ownedBy";
import { resourcesInResource } from "@esposter/db-schema";
import { and, isNull } from "drizzle-orm";

// The owner's live resource as one predicate, for the statements that write a live resource. A write that lands after a
// Delete or after its owner changed matches no row, so it cannot act on a binned resource. Restore and purge act on
// Binned rows by design, so they do not use it
export const getOwnedLiveResourceWhere = (userId: string, id: ResourceInResource["id"]) =>
  and(ownedBy(resourcesInResource, id, userId), isNull(resourcesInResource.deletedAt));
