import type { Row } from "#shared/models/tableEditor/file/datasource/Row";

import { createRow } from "@/composables/tableEditor/file/commands/createRow.test";

// The 5-column basis every table-editor bench fixture is generated against. Co-located with the
// Generator it seeds (rather than constants.bench.ts) so constants.bench can import both from here
// Without a circular import back into this file — the derived fixtures call generateBenchRows at
// Module init, so a cycle would hit the function in its TDZ.
export const BENCH_COLUMN_NAMES = ["a", "b", "c", "d", "e"];

export const generateBenchRows = (count: number, { offset = 0, uniqueValues = count } = {}): Row[] =>
  Array.from({ length: count }, (_, index) => {
    const key = offset + (index % uniqueValues);
    return createRow(Object.fromEntries(BENCH_COLUMN_NAMES.map((name) => [name, key])));
  });
