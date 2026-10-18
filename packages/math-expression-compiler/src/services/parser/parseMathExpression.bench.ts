import { generateSumFormula } from "#src/services/parser/generateSumFormula.bench";
import { parseMathExpression } from "#src/services/parser/parseMathExpression";
import { BENCHMARK_RUN_OPTIONS } from "@esposter/shared-node/bench";
import { describe, test } from "vitest";

const COLUMN_FORMULA = "col0 * (1 - col1) + round(col2, 2)";
// The same shape with its columns written as numbers, so the gap between the two is what a name costs to parse
const LITERAL_FORMULA = "1 * (1 - 2) + round(3, 2)";
const SUM_1K_FORMULA = generateSumFormula(1000);
const SUM_100K_FORMULA = generateSumFormula(100000);
// The same ones as SUM_1K_FORMULA and SUM_100K_FORMULA, joined by operators rather than passed as arguments
const CHAIN_1K_FORMULA = Array.from({ length: 1000 }, () => "1").join(" + ");
const CHAIN_100K_FORMULA = Array.from({ length: 100000 }, () => "1").join(" + ");

// Parsing is linear in the formula's length, so each group holds one scale and its second task is the same length in another shape
describe(parseMathExpression, () => {
  test("the column formula", async ({ bench }) => {
    await bench.compare(
      bench("columns", () => parseMathExpression(COLUMN_FORMULA)),
      bench("literals", () => parseMathExpression(LITERAL_FORMULA)),
      BENCHMARK_RUN_OPTIONS,
    );
  });

  test("a sum of 1000 numbers", async ({ bench }) => {
    await bench.compare(
      bench("arguments", () => parseMathExpression(SUM_1K_FORMULA)),
      bench("operators", () => parseMathExpression(CHAIN_1K_FORMULA)),
      BENCHMARK_RUN_OPTIONS,
    );
  });

  test("a sum of 100000 numbers", async ({ bench }) => {
    await bench.compare(
      bench("arguments", () => parseMathExpression(SUM_100K_FORMULA)),
      bench("operators", () => parseMathExpression(CHAIN_100K_FORMULA)),
      BENCHMARK_RUN_OPTIONS,
    );
  });
});
