import { DeleteColumnsCommand } from "#shared/models/resource/sheet/commands/DeleteColumnsCommand";
import {
  benchColumns,
  benchRows1k,
  benchRows10k,
  benchRows100,
} from "@/composables/resource/sheet/commands/constants.bench";
import { createBenchDataSource } from "@/composables/resource/sheet/commands/createBenchDataSource.bench";
import { setupCommandBench } from "@/composables/resource/sheet/commands/setupCommandBench.bench";
import { describe } from "vitest";

const createColumnIds = (count: number) => benchColumns.slice(0, count).map(({ id }) => id);
const oneColumnIds = createColumnIds(1);
const threeColumnIds = createColumnIds(3);

describe(DeleteColumnsCommand, () => {
  setupCommandBench(
    "delete 1 of 5 columns, 100 rows",
    () => new DeleteColumnsCommand(oneColumnIds),
    () => createBenchDataSource(benchRows100),
  );
  setupCommandBench(
    "delete 1 of 5 columns, 1000 rows",
    () => new DeleteColumnsCommand(oneColumnIds),
    () => createBenchDataSource(benchRows1k),
  );
  setupCommandBench(
    "delete 1 of 5 columns, 10000 rows",
    () => new DeleteColumnsCommand(oneColumnIds),
    () => createBenchDataSource(benchRows10k),
  );
  setupCommandBench(
    "delete 3 of 5 columns, 1000 rows",
    () => new DeleteColumnsCommand(threeColumnIds),
    () => createBenchDataSource(benchRows1k),
  );
  setupCommandBench(
    "delete 3 of 5 columns, 10000 rows",
    () => new DeleteColumnsCommand(threeColumnIds),
    () => createBenchDataSource(benchRows10k),
  );
});
