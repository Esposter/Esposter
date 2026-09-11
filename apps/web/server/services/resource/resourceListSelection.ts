import { resourceAccesses, resources } from "@esposter/db-schema";
import { getColumns } from "drizzle-orm";

// One row shape for every resource list, doubling as the sort space: a column a list can show is a column it
// Can sort by, and no list can be handed a key its query cannot order by
export const resourceListSelection = { ...getColumns(resources), lastAccessedAt: resourceAccesses.accessedAt };
