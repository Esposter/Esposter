import type { RunCopyTablesOptions } from "#src/models/cutover/RunCopyTablesOptions";

import { loadIdMap } from "#src/services/cutover/ids/loadIdMap";
import { copyRoomMessages } from "#src/services/cutover/messages/copyRoomMessages";
import { createSourceClient } from "#src/services/cutover/postgres/createSourceClient";
import { readPendingScheduledJobs } from "#src/services/cutover/postgres/readPendingScheduledJobs";
import { copyTable } from "#src/services/cutover/tables/copyTable";
import { readTableParents } from "#src/services/cutover/tables/readTableParents";
import { tableMappers } from "#src/services/cutover/tables/tableMappers";

const readSourcePendingScheduledJobs = async (sourceDatabaseUrl: string) => {
  const source = createSourceClient(sourceDatabaseUrl);
  const scheduledJobs = await readPendingScheduledJobs(source);
  await source.end();
  return scheduledJobs;
};

// Copies the messages into their rooms' objects, then every mapped Azure Table into its typed table: the full copy live, or the delta in the freeze.
// The parents the rows reference are read from D1 first, so copy-core before it must have run, and assign-ids before both.
// The delta also imports the pending scheduled messages, which only the freeze reads
export const runCopyTables = async (options: RunCopyTablesOptions): Promise<void> => {
  const { archiveBucket, client, delta, executor, sourceDatabaseUrl } = options;
  const parents = await readTableParents(executor);
  const idMap = await loadIdMap(client, archiveBucket);
  const scheduledJobs = delta ? await readSourcePendingScheduledJobs(sourceDatabaseUrl) : [];
  await copyRoomMessages({ ...options, idMap, parents, scheduledJobs });
  for (const mapper of tableMappers)
    // oxlint-disable-next-line no-await-in-loop -- tables copy one after another, so each table's rows see the ids the one before it wrote
    await copyTable({ ...options, idMap, mapper, parents });
};
