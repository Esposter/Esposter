import type { RunCopyTablesOptions } from "#src/models/cutover/RunCopyTablesOptions";

import { loadIdMap } from "#src/services/cutover/ids/loadIdMap";
import { copyRoomMessages } from "#src/services/cutover/messages/copyRoomMessages";
import { copyTable } from "#src/services/cutover/tables/copyTable";
import { readTableParents } from "#src/services/cutover/tables/readTableParents";
import { tableMappers } from "#src/services/cutover/tables/tableMappers";

// Copies the messages into their rooms' objects, then every mapped Azure Table into its typed table: the full copy live, or the delta in the freeze.
// The parents the rows reference are read from D1 first, so copy-core before it must have run, and assign-ids before both
export const runCopyTables = async (options: RunCopyTablesOptions): Promise<void> => {
  const { archiveBucket, client, executor } = options;
  const parents = await readTableParents(executor);
  const idMap = await loadIdMap(client, archiveBucket);
  await copyRoomMessages({ ...options, idMap, parents });
  for (const mapper of tableMappers)
    // oxlint-disable-next-line no-await-in-loop -- tables copy one after another, so each table's rows see the ids the one before it wrote
    await copyTable({ ...options, idMap, mapper, parents });
};
