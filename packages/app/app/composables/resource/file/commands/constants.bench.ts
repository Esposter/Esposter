import { createColumn } from "@/composables/tableEditor/file/commands/createColumn.test";
import { createDataSource } from "@/composables/tableEditor/file/commands/createDataSource.test";
import { BENCH_COLUMN_NAMES, generateBenchRows } from "@/composables/tableEditor/file/commands/generateBenchRows.bench";

export const benchColumns = BENCH_COLUMN_NAMES.map((name) => createColumn(name));

export const benchRows100 = generateBenchRows(100);
export const benchRows1k = generateBenchRows(1000);
export const benchRows10k = generateBenchRows(10000);

export const benchDataSource100AllUnique = createDataSource(
  benchColumns,
  generateBenchRows(100, { uniqueValues: 100 }),
);
export const benchDataSource1kAllUnique = createDataSource(
  benchColumns,
  generateBenchRows(1000, { uniqueValues: 1000 }),
);
export const benchDataSource10kAllUnique = createDataSource(
  benchColumns,
  generateBenchRows(10000, { uniqueValues: 10000 }),
);

export const benchDataSource100HalfDuplicates = createDataSource(
  benchColumns,
  generateBenchRows(100, { uniqueValues: 50 }),
);
export const benchDataSource1kHalfDuplicates = createDataSource(
  benchColumns,
  generateBenchRows(1000, { uniqueValues: 500 }),
);
export const benchDataSource10kHalfDuplicates = createDataSource(
  benchColumns,
  generateBenchRows(10000, { uniqueValues: 5000 }),
);

export const benchDataSource100AllDuplicates = createDataSource(
  benchColumns,
  generateBenchRows(100, { uniqueValues: 1 }),
);
export const benchDataSource1kAllDuplicates = createDataSource(
  benchColumns,
  generateBenchRows(1000, { uniqueValues: 1 }),
);
export const benchDataSource10kAllDuplicates = createDataSource(
  benchColumns,
  generateBenchRows(10000, { uniqueValues: 1 }),
);
