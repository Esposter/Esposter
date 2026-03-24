import {
  benchRows1k,
  benchRows10k,
  benchRows100,
  makeBenchItem,
  makeEveryNthIndexedRows,
} from "@/composables/tableEditor/file/commands/testUtils.bench";
import { DeleteRowsCommand } from "@/models/tableEditor/file/commands/DeleteRowsCommand";
import { bench, describe } from "vitest";

// ~50% deletion at each scale
const indexedRows50 = makeEveryNthIndexedRows(benchRows100, 2);
const indexedRows500 = makeEveryNthIndexedRows(benchRows1k, 2);
const indexedRows5k = makeEveryNthIndexedRows(benchRows10k, 2);

describe(DeleteRowsCommand, () => {
  bench("execute — delete 50 rows from 100", () => {
    new DeleteRowsCommand(indexedRows50).execute(makeBenchItem(benchRows100));
  });

  bench("execute — delete 500 rows from 1000", () => {
    new DeleteRowsCommand(indexedRows500).execute(makeBenchItem(benchRows1k));
  });

  bench("execute — delete 5000 rows from 10000", () => {
    new DeleteRowsCommand(indexedRows5k).execute(makeBenchItem(benchRows10k));
  });

  bench("undo — re-insert 50 rows into 50", () => {
    const item = makeBenchItem(benchRows100);
    const command = new DeleteRowsCommand(indexedRows50);
    command.execute(item);
    command.undo(item);
  });

  bench("undo — re-insert 500 rows into 500", () => {
    const item = makeBenchItem(benchRows1k);
    const command = new DeleteRowsCommand(indexedRows500);
    command.execute(item);
    command.undo(item);
  });

  bench("undo — re-insert 5000 rows into 5000", () => {
    const item = makeBenchItem(benchRows10k);
    const command = new DeleteRowsCommand(indexedRows5k);
    command.execute(item);
    command.undo(item);
  });
});
