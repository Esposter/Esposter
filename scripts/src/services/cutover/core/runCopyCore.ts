import { readCutoverEnvironment } from "#src/services/cutover/readCutoverEnvironment";
import { copyCoreTable } from "#src/services/cutover/core/copyCoreTable";
import { createCoreExecutor } from "#src/services/cutover/cloudflare/d1/createCoreExecutor";
import { getCoreTables } from "#src/services/cutover/core/getCoreTables";
import { orderCoreTables } from "#src/services/cutover/core/orderCoreTables";
import { createSourceClient } from "#src/services/cutover/postgres/createSourceClient";
import { syncCoreTableKeys } from "#src/services/cutover/core/syncCoreTableKeys";

// Copies every Postgres table into `core` in foreign-key order, then drops the rows the source no longer holds, children
// first. Idempotent: a re-run upserts the same rows and removes the same extras, so it can run live as well as in the freeze
export const runCopyCore = async (): Promise<void> => {
  const environment = readCutoverEnvironment();
  const source = createSourceClient(environment.SOURCE_DATABASE_URL);
  const executor = createCoreExecutor(environment);
  const tables = orderCoreTables(getCoreTables());
  for (const table of tables) console.info(`${table.name}: ${await copyCoreTable(source, executor, table)} rows`);
  for (const table of [...tables].reverse()) {
    const removed = await syncCoreTableKeys(source, executor, table);
    if (removed > 0) console.info(`${table.name}: removed ${removed} rows the source no longer holds`);
  }
  await source.end();
};
