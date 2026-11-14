import type { IdMap } from "#src/models/cutover/IdMap";
import type { R2Client } from "#src/models/cutover/R2Client";

import { createIdMap } from "#src/services/cutover/tables/createIdMap";
import { tableMappers } from "#src/services/cutover/tables/tableMappers";

// The id map of the archive bucket, loaded with every Azure table the copy maps
export const loadIdMap = (client: R2Client, archiveBucket: string): Promise<IdMap> =>
  createIdMap(
    client,
    archiveBucket,
    tableMappers.map(({ azureTable }) => azureTable),
  );
