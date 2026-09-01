import type { Row } from "#shared/models/resource/sheet/datasource/Row";
import type { IndexedRow } from "@/models/resource/sheet/commands/IndexedRow";

import { benchRows1k, benchRows10k, benchRows100 } from "@/composables/resource/sheet/commands/constants.bench";
import { createBenchDataSource } from "@/composables/resource/sheet/commands/createBenchDataSource.bench";
import { setupCommandBench } from "@/composables/resource/sheet/commands/setupCommandBench.bench";
import { DeleteRowsCommand } from "@/models/resource/sheet/commands/DeleteRowsCommand";
import { describe } from "vitest";

// ~50% deletion at each scale, each row paired with the index its undo restores it to. Read-only input to the
// Command, so it is built once rather than per iteration.
const createEveryOtherIndexedRows = (rows: Row[]): IndexedRow[] =>
  rows.flatMap((row, index) => (index % 2 === 0 ? [{ index, row }] : []));
const indexedRows50 = createEveryOtherIndexedRows(benchRows100);
const indexedRows500 = createEveryOtherIndexedRows(benchRows1k);
const indexedRows5k = createEveryOtherIndexedRows(benchRows10k);

describe(DeleteRowsCommand, () => {
  setupCommandBench(
    "delete 50 rows from 100",
    () => new DeleteRowsCommand(indexedRows50),
    () => createBenchDataSource(benchRows100),
  );
  setupCommandBench(
    "delete 500 rows from 1000",
    () => new DeleteRowsCommand(indexedRows500),
    () => createBenchDataSource(benchRows1k),
  );
  setupCommandBench(
    "delete 5000 rows from 10000",
    () => new DeleteRowsCommand(indexedRows5k),
    () => createBenchDataSource(benchRows10k),
  );
});
