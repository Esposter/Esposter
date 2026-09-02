import { createColumn } from "@/composables/resource/sheet/commands/createColumn.test";
import { BENCH_COLUMN_NAMES, generateBenchRows } from "@/composables/resource/sheet/commands/generateBenchRows.bench";
import { describe } from "vitest";

export const benchColumns = BENCH_COLUMN_NAMES.map((name) => createColumn(name));

export const benchRows100 = generateBenchRows(100);
export const benchRows1k = generateBenchRows(1000);
export const benchRows10k = generateBenchRows(10000);

describe.todo("constants");
