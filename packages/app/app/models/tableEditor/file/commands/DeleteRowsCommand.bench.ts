import { benchRows1k, benchRows10k, benchRows100 } from "@/composables/tableEditor/file/commands/constants.bench";
import { createBenchItem } from "@/composables/tableEditor/file/commands/createBenchItem.bench";
import { createEveryNthIndexedRows } from "@/composables/tableEditor/file/commands/createEveryNthIndexedRows.bench";
import { DeleteRowsCommand } from "@/models/tableEditor/file/commands/DeleteRowsCommand";
import { bench, describe } from "vitest";

// ~50% deletion at each scale
const indexedRows50 = createEveryNthIndexedRows(benchRows100, 2);
const indexedRows500 = createEveryNthIndexedRows(benchRows1k, 2);
const indexedRows5k = createEveryNthIndexedRows(benchRows10k, 2);

describe(DeleteRowsCommand, () => {
  bench("execute — delete 50 rows from 100", () => {
    new DeleteRowsCommand(indexedRows50).execute(createBenchItem(benchRows100));
  });

  bench("execute — delete 500 rows from 1000", () => {
    new DeleteRowsCommand(indexedRows500).execute(createBenchItem(benchRows1k));
  });

  bench("execute — delete 5000 rows from 10000", () => {
    new DeleteRowsCommand(indexedRows5k).execute(createBenchItem(benchRows10k));
  });

  bench("undo — re-insert 50 rows into 50", () => {
    const item = createBenchItem(benchRows100);
    const command = new DeleteRowsCommand(indexedRows50);
    command.execute(item);
    command.undo(item);
  });

  bench("undo — re-insert 500 rows into 500", () => {
    const item = createBenchItem(benchRows1k);
    const command = new DeleteRowsCommand(indexedRows500);
    command.execute(item);
    command.undo(item);
  });

  bench("undo — re-insert 5000 rows into 5000", () => {
    const item = createBenchItem(benchRows10k);
    const command = new DeleteRowsCommand(indexedRows5k);
    command.execute(item);
    command.undo(item);
  });
});
