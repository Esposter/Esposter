import { compileMathExpression } from "#src/services/compiler/compileMathExpression";
import { parseNode } from "#src/services/compiler/parseNode.test";
import { generateSumFormula } from "#src/services/parser/generateSumFormula.fixture";
import { BENCHMARK_RUN_OPTIONS } from "@esposter/shared-node/bench";
import { describe, test } from "vitest";

const COLUMN_FORMULA = "col0 * (1 - col1) + round(col2, 2)";
const SUM_1K_FORMULA = generateSumFormula(1000);
const SUM_100K_FORMULA = generateSumFormula(100000);
const FOLDED_FORMULA = "col0 * (2 ^ 10 + sqrt(16))";
const UNFOLDED_FORMULA = "col0 * (col1 ^ 10 + sqrt(col2))";
const COLUMN_NAMES = ["col0", "col1", "col2"];
const ROW_COUNT = 10000;
const rows = Array.from({ length: ROW_COUNT }, (_row, index): [number, number, number] => [
  index,
  index / 3,
  index / 7,
]);
const results = new Float64Array(ROW_COUNT);

const columnNode = parseNode(COLUMN_FORMULA);
const sum1kNode = parseNode(SUM_1K_FORMULA);
const sum100kNode = parseNode(SUM_100K_FORMULA);
const foldedNode = parseNode(FOLDED_FORMULA);
const unfoldedNode = parseNode(UNFOLDED_FORMULA);

// Compiling walks the tree once, so the unit is handed a parsed tree; the second task parses the text as well, which is
// What a sheet column pays each time its formula changes, and reads the parse's share of the path
describe(compileMathExpression, () => {
  test("compile the column formula", async ({ bench }) => {
    await bench.compare(
      bench("compile", () => compileMathExpression(columnNode, COLUMN_NAMES)),
      bench("parse and compile", () => compileMathExpression(parseNode(COLUMN_FORMULA), COLUMN_NAMES)),
      BENCHMARK_RUN_OPTIONS,
    );
  });

  test("compile a sum of 1000 numbers", async ({ bench }) => {
    await bench.compare(
      bench("compile", () => compileMathExpression(sum1kNode, [])),
      bench("parse and compile", () => compileMathExpression(parseNode(SUM_1K_FORMULA), [])),
      BENCHMARK_RUN_OPTIONS,
    );
  });

  test("compile a sum of 100000 numbers", async ({ bench }) => {
    await bench.compare(
      bench("compile", () => compileMathExpression(sum100kNode, [])),
      bench("parse and compile", () => compileMathExpression(parseNode(SUM_100K_FORMULA), [])),
      BENCHMARK_RUN_OPTIONS,
    );
  });

  // The sheet's per-row path: one compiled call per row, every row in one iteration. The native task is the same
  // Arithmetic written by hand, the baseline the interpreted call is measured against
  test("evaluate the column formula over 10000 rows", async ({ bench }) => {
    const evaluate = compileMathExpression(columnNode, COLUMN_NAMES);
    await bench.compare(
      bench("compiled", () => {
        for (const [rowIndex, row] of rows.entries()) results[rowIndex] = evaluate(row);
      }),
      bench("native", () => {
        for (const [rowIndex, [col0, col1, col2]] of rows.entries())
          results[rowIndex] = col0 * (1 - col1) + Math.round(col2 * 100) / 100;
      }),
      BENCHMARK_RUN_OPTIONS,
    );
  });

  // A subtree of constants folds at compile time, so the folded formula evaluates as a single product of a variable
  test("evaluate a formula whose subtree folds over 10000 rows", async ({ bench }) => {
    const folded = compileMathExpression(foldedNode, COLUMN_NAMES);
    const unfolded = compileMathExpression(unfoldedNode, COLUMN_NAMES);
    await bench.compare(
      bench("folded", () => {
        for (const [rowIndex, row] of rows.entries()) results[rowIndex] = folded(row);
      }),
      bench("unfolded", () => {
        for (const [rowIndex, row] of rows.entries()) results[rowIndex] = unfolded(row);
      }),
      BENCHMARK_RUN_OPTIONS,
    );
  });
});
