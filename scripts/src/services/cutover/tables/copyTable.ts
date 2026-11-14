import type { CopyTableOptions } from "#src/models/cutover/CopyTableOptions";
import type { CutoverCheckpoint } from "#src/models/cutover/CutoverCheckpoint";

import { createTableClient } from "#src/services/cutover/azure/createTableClient";
import { readCheckpoint } from "#src/services/cutover/checkpoint/readCheckpoint";
import { writeCheckpoint } from "#src/services/cutover/checkpoint/writeCheckpoint";
import { DELTA_CLOCK_MARGIN_MS } from "#src/services/cutover/objects/constants";
import { copyMapperRows } from "#src/services/cutover/tables/copyMapperRows";
import { COPY_TABLES_UNIT_PREFIX } from "#src/services/cutover/tables/constants";
import { deleteStaleMapperRows } from "#src/services/cutover/tables/deleteStaleMapperRows";
import { getMapperCoreTable } from "#src/services/cutover/tables/getMapperCoreTable";
import { linkMapperRows } from "#src/services/cutover/tables/linkMapperRows";
import { listMapperEntities } from "#src/services/cutover/tables/listMapperEntities";
import { InvalidOperationError, Operation } from "@esposter/shared";

// One Azure Table into its typed table. The full copy runs while the app is live and records when it began. The delta copies what
// changed since then, links it, and removes the rows Azure no longer lists. Both are re-runnable: an entity keeps the id the id map
// gave it, so a re-run upserts the same rows
export const copyTable = async (options: CopyTableOptions): Promise<void> => {
  const { archiveBucket, client, connectionString, delta, executor, idMap, mapper, parents } = options;
  const unit = `${COPY_TABLES_UNIT_PREFIX}/${mapper.azureTable}`;
  const checkpoint: CutoverCheckpoint = (await readCheckpoint(client, archiveBucket, unit)) ?? {};
  const coreTable = getMapperCoreTable(mapper.coreTable);
  const tableClient = createTableClient(connectionString, mapper.azureTable);
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
    await linkMapperRows({ ...rowsOptions, entities: listMapperEntities(tableClient, mapper.azureTable) });
    await writeCheckpoint(client, archiveBucket, unit, {
      ...checkpoint,
      completedAt: new Date().toISOString(),
      preCopyStartedAt,
    });
    console.info(`${mapper.azureTable}: copied ${copied.copied}, skipped ${copied.skipped}`);
    return;
  }

  if (!checkpoint.preCopyStartedAt)
    throw new InvalidOperationError(
      Operation.Read,
      unit,
      "has no pre-copy to take changes from: copy-tables must run first",
    );
  if (!checkpoint.completedAt)
    throw new InvalidOperationError(Operation.Read, unit, "has an unfinished full copy: copy-tables must finish first");
  const changedSince = new Date(Date.parse(checkpoint.preCopyStartedAt) - DELTA_CLOCK_MARGIN_MS).toISOString();
  const filter = `Timestamp gt datetime'${changedSince}'`;
  const copied = await copyMapperRows({
    ...rowsOptions,
    entities: listMapperEntities(tableClient, mapper.azureTable, { filter }),
  });
  await linkMapperRows({ ...rowsOptions, entities: listMapperEntities(tableClient, mapper.azureTable, { filter }) });
  // Every entity Azure lists, changed or not, so the rows of one it no longer lists are the ones removed
  const removed = await deleteStaleMapperRows({
    ...rowsOptions,
    entities: listMapperEntities(tableClient, mapper.azureTable),
  });
  await writeCheckpoint(client, archiveBucket, unit, { ...checkpoint, deltaCompletedAt: new Date().toISOString() });
  console.info(`${mapper.azureTable}: copied ${copied.copied}, skipped ${copied.skipped}, removed ${removed}`);
};
