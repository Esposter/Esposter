import { DeleteColumnsCommand } from "#shared/models/resource/sheet/commands/DeleteColumnsCommand";
import {
  benchColumns,
  benchRows1k,
  benchRows10k,
  benchRows100,
} from "#src/composables/resource/sheet/commands/constants.bench";
import { createBenchDataSource } from "#src/composables/resource/sheet/commands/createBenchDataSource.bench";
import { setupCommandBench } from "#src/composables/resource/sheet/commands/setupCommandBench.bench";
import { describe } from "vitest";

const createColumnIds = (count: number) => benchColumns.slice(0, count).map(({ id }) => id);
const oneColumnIds = createColumnIds(1);
const threeColumnIds = createColumnIds(3);

describe(DeleteColumnsCommand, () => {
  setupCommandBench("delete columns, 100 rows", [
    {
      createCommand: () => new DeleteColumnsCommand(oneColumnIds),
      createDataSource: () => createBenchDataSource(benchRows100),
      name: "1 of 5 columns",
    },
  ]);
  setupCommandBench("delete columns, 1000 rows", [
    {
      createCommand: () => new DeleteColumnsCommand(oneColumnIds),
      createDataSource: () => createBenchDataSource(benchRows1k),
      name: "1 of 5 columns",
    },
    {
      createCommand: () => new DeleteColumnsCommand(threeColumnIds),
      createDataSource: () => createBenchDataSource(benchRows1k),
      name: "3 of 5 columns",
    },
  ]);
  setupCommandBench("delete columns, 10000 rows", [
    {
      createCommand: () => new DeleteColumnsCommand(oneColumnIds),
      createDataSource: () => createBenchDataSource(benchRows10k),
      name: "1 of 5 columns",
    },
    {
      createCommand: () => new DeleteColumnsCommand(threeColumnIds),
      createDataSource: () => createBenchDataSource(benchRows10k),
      name: "3 of 5 columns",
    },
  ]);
});
