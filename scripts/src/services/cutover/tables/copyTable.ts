import type { CopyTableOptions } from "#src/models/cutover/CopyTableOptions";
import type { CutoverCheckpoint } from "#src/models/cutover/CutoverCheckpoint";

import { getChangedSince } from "#src/services/cutover/checkpoint/getChangedSince";
import { readCheckpoint } from "#src/services/cutover/checkpoint/readCheckpoint";
import { writeCheckpoint } from "#src/services/cutover/checkpoint/writeCheckpoint";
import { COPY_TABLES_UNIT_PREFIX } from "#src/services/cutover/tables/constants";
import { copyMapperRows } from "#src/services/cutover/tables/copyMapperRows";
import { deleteStaleMapperRows } from "#src/services/cutover/tables/deleteStaleMapperRows";
import { getMapperCoreTable } from "#src/services/cutover/tables/getMapperCoreTable";
import { listMapperEntities } from "#src/services/cutover/tables/listMapperEntities";
import { TableClient } from "@azure/data-tables";

// One Azure Table into its typed table.
// The full copy runs while the app is live and records when it began.
// The delta copies what changed since then and removes the rows Azure no longer lists.
// Both are re-runnable: an entity keeps the id the id map gave it, so a re-run upserts the same rows
export const copyTable = async (options: CopyTableOptions): Promise<void> => {
  const { archiveBucket, client, connectionString, delta, executor, idMap, mapper, parents } = options;
  const unit = `${COPY_TABLES_UNIT_PREFIX}/${mapper.azureTable}`;
  const checkpoint: CutoverCheckpoint = (await readCheckpoint(client, archiveBucket, unit)) ?? {};
  const coreTable = getMapperCoreTable(mapper.coreTable);
  const tableClient = TableClient.fromConnectionString(connectionString, mapper.azureTable);
  const rowsOptions = { coreTable, executor, idMap, mapper, parents };

  if (!delta) {
    if (checkpoint.completedAt) return;
    // Kept once set: the delta measures changes from this instant, so a re-run must not move it
    const preCopyStartedAt = checkpoint.preCopyStartedAt ?? new Date().toISOString();
    await writeCheckpoint(client, archiveBucket, unit, { ...checkpoint, preCopyStartedAt });
    const copied = await copyMapperRows({
      ...rowsOptions,
      entities: listMapperEntities(tableClient, mapper.azureTable),
    });
    await writeCheckpoint(client, archiveBucket, unit, {
      ...checkpoint,
      completedAt: new Date().toISOString(),
      preCopyStartedAt,
    });
    console.info(`${mapper.azureTable}: copied ${copied.copied}, skipped ${copied.skipped}`);
    return;
  }

  const changedSince = getChangedSince(checkpoint, unit);
  const filter = `Timestamp gt datetime'${changedSince}'`;
  const copied = await copyMapperRows({
    ...rowsOptions,
    entities: listMapperEntities(tableClient, mapper.azureTable, { filter }),
  });
  // Every entity Azure lists, changed or not, so the rows of one it no longer lists are the ones removed
  const removed = await deleteStaleMapperRows({
    ...rowsOptions,
    entities: listMapperEntities(tableClient, mapper.azureTable),
  });
  await writeCheckpoint(client, archiveBucket, unit, { ...checkpoint, deltaCompletedAt: new Date().toISOString() });
  console.info(`${mapper.azureTable}: copied ${copied.copied}, skipped ${copied.skipped}, removed ${removed}`);
};
