import type { CoreTable } from "#src/models/cutover/CoreTable";

import { getCoreTables } from "#src/services/cutover/core/getCoreTables";
import { tableMappers } from "#src/services/cutover/tables/tableMappers";

// D1 tables Postgres never held: the lease rows a snapshot takes, which the cutover starts empty
const NEW_CORE_TABLE_NAMES = new Set(["resource_resourceObjectLocks"]);

// The D1 tables copied from Postgres: every table of the schema but the typed ones the Azure mappers fill and the ones new to
// D1. Any other table missing from Postgres fails the copy by name rather than being skipped, so a renamed table is noticed
export const getPostgresCoreTables = (): CoreTable[] => {
  const mapperTableNames = new Set(tableMappers.map(({ coreTable }) => coreTable));
  return getCoreTables().filter(({ name }) => !mapperTableNames.has(name) && !NEW_CORE_TABLE_NAMES.has(name));
};
