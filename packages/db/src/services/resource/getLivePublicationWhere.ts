import type { SQL } from "drizzle-orm";

import { resourcePublicationsInResource } from "@esposter/db-schema";
import { and, isNull } from "drizzle-orm";

// An unpublish keeps the publication as a tombstone, so a statement that decides whether a resource is published, or
// What it serves, takes only the live row. The readers that return the row to a client keep the tombstone, which is how
// A removal reaches a row the client holds
export const getLivePublicationWhere = (where?: SQL) => and(where, isNull(resourcePublicationsInResource.deletedAt));
