import type { CutoverEnvironment } from "#src/models/cutover/CutoverEnvironment";

import { POSTGRES_ID_MAP_SCOPE } from "#src/services/cutover/constants";
import { createR2Client } from "#src/services/cutover/cloudflare/r2/createR2Client";
import { getCoreTables } from "#src/services/cutover/core/getCoreTables";
import { assignCoreTableIds } from "#src/services/cutover/ids/assignCoreTableIds";
import { loadIdMap } from "#src/services/cutover/ids/loadIdMap";
import { getCutoverArchiveBucketName } from "#src/services/cutover/getCutoverArchiveBucketName";
import { createSourceClient } from "#src/services/cutover/postgres/createSourceClient";
import { readCutoverEnvironment } from "#src/services/cutover/readCutoverEnvironment";

// Gives every Postgres row its new id before anything copies a reference to it: the objects' keys, the core rows and the tables'
// parents all read the map. Idempotent, so it runs again before the freeze picks up the rows created since
export const runAssignIds = async (cutoverEnvironment: CutoverEnvironment): Promise<void> => {
  const variables = readCutoverEnvironment();
  const source = createSourceClient(variables.SOURCE_DATABASE_URL);
  const idMap = await loadIdMap(createR2Client(), getCutoverArchiveBucketName(cutoverEnvironment));
  for (const table of getCoreTables()) await assignCoreTableIds(source, table, idMap);
  await idMap.flush(POSTGRES_ID_MAP_SCOPE);
  await source.end();
};
