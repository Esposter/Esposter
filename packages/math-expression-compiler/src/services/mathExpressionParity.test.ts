import { checkIsNearlyEqual } from "#src/services/checkIsNearlyEqual";
import { compileMathExpression } from "#src/services/compileMathExpression";
import { parseMathExpression } from "#src/services/parseMathExpression";
import { jsonDateParse } from "@esposter/shared";
import { readFileSync } from "node:fs";
import { describe, expect, test } from "vitest";

interface Snapshot {
  entries: SnapshotEntry[];
  mathjs: string;
}
interface SnapshotEntry {
  fix?: { issue: string; value: SnapshotValue };
  formula: string;
  scope: Record<string, number>;
  tolerance?: boolean;
  value: SnapshotValue;
}
type SnapshotValue = boolean | null | number | string;

const SNAPSHOT_PATH = new URL("mathExpressionParity.snapshot.json", import.meta.url);
const NUMBER_SPELLINGS: Readonly<Record<string, number>> = {
  "-Infinity": Number.NEGATIVE_INFINITY,
  Infinity: Number.POSITIVE_INFINITY,
  NaN: Number.NaN,
};

const decodeValue = (value: SnapshotValue): number => {
  if (value === null) return Number.NaN;
  if (typeof value === "boolean") return value ? 1 : 0;
  if (typeof value === "string") return NUMBER_SPELLINGS[value] ?? Number.NaN;
  return value;
};

const checkIsMatching = (expected: number, actual: number, isTolerant: boolean): boolean => {
  if (Number.isNaN(expected)) return Number.isNaN(actual);
  if (!isTolerant || !Number.isFinite(expected)) return expected === actual;
  return checkIsNearlyEqual(expected, actual);
};

const evaluateFormula = (formula: string, scope: Record<string, number>): number =>
  parseMathExpression(formula).match(
    (node) => compileMathExpression(node, Object.keys(scope))(Object.values(scope)),
    () => Number.NaN,
  );

const { entries, mathjs }: Snapshot = jsonDateParse(readFileSync(SNAPSHOT_PATH, "utf8"));

describe(compileMathExpression, () => {
  test.each([["The parity corpus matches mathjs's recorded answers"]])("%s", (_title) => {
    expect.hasAssertions();
    expect(mathjs).toBe("15.2.0");

    const mismatches = entries.flatMap((entry) => {
      const expected = entry.fix === undefined ? decodeValue(entry.value) : decodeValue(entry.fix.value);
      const actual = evaluateFormula(entry.formula, entry.scope);
      const isTolerant = entry.tolerance === true;
      return checkIsMatching(expected, actual, isTolerant) ? [] : [{ actual, entry, expected }];
    });

    expect(mismatches).toStrictEqual([]);
  });
});
