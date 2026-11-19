import { resourcesInResource } from "@esposter/db-schema";
import { sql } from "drizzle-orm";

// The same match restricted to the name column, which orders a name match above a row matched only by a tag
export const getResourceNameSearchMatch = (expression: string) =>
  sql`${resourcesInResource.id} in (select id from resources_search where resources_search match ${`name : (${expression})`})`;
