import type { RunCopyTablesOptions } from "#src/models/cutover/RunCopyTablesOptions";

import { copyTable } from "#src/services/cutover/tables/copyTable";
import { createIdMap } from "#src/services/cutover/tables/createIdMap";
import { readTableParents } from "#src/services/cutover/tables/readTableParents";
import { tableMappers } from "#src/services/cutover/tables/tableMappers";

// Copies every mapped Azure Table, in the order the mappers list them: the full copy live, or the delta in the freeze. The parents
// the rows reference are read from D1 first, so the copy-core before it must have run
export const runCopyTables = async (options: RunCopyTablesOptions): Promise<void> => {
  const { archiveBucket, client, executor } = options;
  const parents = await readTableParents(executor);
  const idMap = await createIdMap(
    client,
    archiveBucket,
    tableMappers.map(({ azureTable }) => azureTable),
  );
  for (const mapper of tableMappers) {
    // oxlint-disable-next-line no-await-in-loop -- tables copy one after another, so an emoji's message is already written
    await copyTable({ ...options, idMap, mapper, parents });
  }
};
