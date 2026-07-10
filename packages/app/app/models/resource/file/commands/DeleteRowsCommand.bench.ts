import { benchRows1k, benchRows10k, benchRows100 } from "@/composables/resource/file/commands/constants.bench";
import { createBenchDataSource } from "@/composables/resource/file/commands/createBenchDataSource.bench";
import { createEveryNthIndexedRows } from "@/composables/resource/file/commands/createEveryNthIndexedRows.bench";
import { DeleteRowsCommand } from "@/models/resource/file/commands/DeleteRowsCommand";
import { bench, describe } from "vitest";

// ~50% deletion at each scale
const indexedRows50 = createEveryNthIndexedRows(benchRows100, 2);
const indexedRows500 = createEveryNthIndexedRows(benchRows1k, 2);
const indexedRows5k = createEveryNthIndexedRows(benchRows10k, 2);

describe(DeleteRowsCommand, () => {
  bench("execute — delete 50 rows from 100", () => {
    new DeleteRowsCommand(indexedRows50).execute(createBenchDataSource(benchRows100));
  });

  bench("execute — delete 500 rows from 1000", () => {
    new DeleteRowsCommand(indexedRows500).execute(createBenchDataSource(benchRows1k));
  });

  bench("execute — delete 5000 rows from 10000", () => {
    new DeleteRowsCommand(indexedRows5k).execute(createBenchDataSource(benchRows10k));
  });

  bench("undo — re-insert 50 rows into 50", () => {
    const dataSource = createBenchDataSource(benchRows100);
    const command = new DeleteRowsCommand(indexedRows50);
    command.execute(dataSource);
    command.undo(dataSource);
  });

  bench("undo — re-insert 500 rows into 500", () => {
    const dataSource = createBenchDataSource(benchRows1k);
    const command = new DeleteRowsCommand(indexedRows500);
    command.execute(dataSource);
    command.undo(dataSource);
  });

  bench("undo — re-insert 5000 rows into 5000", () => {
    const dataSource = createBenchDataSource(benchRows10k);
    const command = new DeleteRowsCommand(indexedRows5k);
    command.execute(dataSource);
    command.undo(dataSource);
  });
});
