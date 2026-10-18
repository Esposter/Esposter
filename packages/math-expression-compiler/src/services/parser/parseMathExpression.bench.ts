import { generateOnes } from "#src/services/parser/generateOnes.fixture";
import { generateSumFormula } from "#src/services/parser/generateSumFormula.fixture";
import { parseMathExpression } from "#src/services/parser/parseMathExpression";
import { BENCHMARK_RUN_OPTIONS } from "@esposter/shared-node/bench";
import { describe, test } from "vitest";

const COLUMN_FORMULA = "col0 * (1 - col1) + round(col2, 2)";
// The same shape with its columns written as numbers, so the gap between the two is what a name costs to parse
const LITERAL_FORMULA = "1 * (1 - 2) + round(3, 2)";
const SUM_1K_FORMULA = generateSumFormula(1000);
const SUM_100K_FORMULA = generateSumFormula(100000);
// The same ones as SUM_1K_FORMULA and SUM_100K_FORMULA, joined by operators rather than passed as arguments
const CHAIN_1K_FORMULA = generateOnes(1000, " + ");
const CHAIN_100K_FORMULA = generateOnes(100000, " + ");

// Parsing is linear in the formula's length, so each group holds one scale and its second task holds the same operands in another shape
// The chain is not the same length: it joins with " + " where the sum joins with ", " and wraps them in "sum(" and ")"
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
