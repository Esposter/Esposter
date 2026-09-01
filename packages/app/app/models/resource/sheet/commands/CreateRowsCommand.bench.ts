import { benchRows1k, benchRows10k, benchRows100 } from "@/composables/resource/sheet/commands/constants.bench";
import { createBenchDataSource } from "@/composables/resource/sheet/commands/createBenchDataSource.bench";
import { generateBenchRows } from "@/composables/resource/sheet/commands/generateBenchRows.bench";
import { setupCommandBench } from "@/composables/resource/sheet/commands/setupCommandBench.bench";
import { CreateRowsCommand } from "@/models/resource/sheet/commands/CreateRowsCommand";
import { describe } from "vitest";

// Offset past the largest fixture so an inserted row never collides with one already there.
const insertRows100 = generateBenchRows(100, { offset: 10000 });
const insertRows1k = generateBenchRows(1000, { offset: 10000 });
const insertRows10k = generateBenchRows(10000, { offset: 10000 });

describe(CreateRowsCommand, () => {
  setupCommandBench(
    "insert 100 rows into 100",
    () => new CreateRowsCommand(50, insertRows100),
    () => createBenchDataSource(benchRows100),
  );
  setupCommandBench(
    "insert 100 rows into 1000",
    () => new CreateRowsCommand(500, insertRows100),
    () => createBenchDataSource(benchRows1k),
  );
  setupCommandBench(
    "insert 1000 rows into 10000",
    () => new CreateRowsCommand(5000, insertRows1k),
    () => createBenchDataSource(benchRows10k),
  );
  setupCommandBench(
    "insert 10000 rows into 10000",
    () => new CreateRowsCommand(5000, insertRows10k),
    () => createBenchDataSource(benchRows10k),
  );
});
