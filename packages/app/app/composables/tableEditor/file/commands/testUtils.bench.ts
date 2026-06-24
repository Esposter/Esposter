import type { Row } from "#shared/models/tableEditor/file/datasource/Row";
import type { IndexedRow } from "@/models/tableEditor/file/commands/IndexedRow";

import { CsvDataSourceItem } from "#shared/models/tableEditor/file/csv/CsvDataSourceItem";
import { createColumn, createDataSource, createRow } from "@/composables/tableEditor/file/commands/testUtils.test";

export const BENCH_COLUMN_NAMES = ["a", "b", "c", "d", "e"];
export const benchColumns = BENCH_COLUMN_NAMES.map((name) => createColumn(name));

export const generateBenchRows = (count: number, { offset = 0, uniqueValues = count } = {}): Row[] =>
  Array.from({ length: count }, (_, index) => {
    const key = offset + (index % uniqueValues);
    return createRow(Object.fromEntries(BENCH_COLUMN_NAMES.map((name) => [name, key])));
  });

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

export const createEveryNthIndexedRows = (rows: Row[], step: number): IndexedRow[] =>
  rows.flatMap((row, index) => (index % step === 0 ? [{ index, row }] : []));

export const createBenchItem = (rows: Row[]) => {
  const item = new CsvDataSourceItem();
  item.dataSource = createDataSource(benchColumns, [...rows]);
  return item;
};

export const createBenchItemWithRows = (rows: Row[]) => {
  const item = new CsvDataSourceItem();
  item.dataSource = createDataSource(benchColumns, rows);
  return item;
};

export const createOriginalRowValues = (rows: Row[], columnName: string) =>
  rows.map((row) => row.data[columnName] ?? null);
