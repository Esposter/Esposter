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
  fix?: { cause: string; value: SnapshotValue };
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

// Null where the parser refuses the formula, which is not a NaN answer
const evaluateFormula = (formula: string, scope: Record<string, number>): null | number =>
  parseMathExpression(formula).match(
    (node) => compileMathExpression(node, Object.keys(scope))(Object.values(scope)),
    () => null,
  );

// The entries whose answer our evaluation does not give, where a fix row's recorded answer is the one we give
const getMismatches = (entries: SnapshotEntry[]): { actual: null | number; entry: SnapshotEntry; expected: number }[] =>
  entries.flatMap((entry) => {
    const recorded = entry.fix === undefined ? entry.value : entry.fix.value;
    const expected = decodeValue(recorded);
    const actual = evaluateFormula(entry.formula, entry.scope);
    // Only a recorded null, where mathjs had no number, may be a formula the parser refuses
    if (actual === null) return recorded === null ? [] : [{ actual, entry, expected }];

    const isTolerant = entry.tolerance === true;
    return checkIsMatching(expected, actual, isTolerant) ? [] : [{ actual, entry, expected }];
  });

const { entries, mathjs }: Snapshot = jsonDateParse(readFileSync(SNAPSHOT_PATH, "utf8"));
const causes = [...new Set(entries.flatMap((entry) => (entry.fix === undefined ? [] : [entry.fix.cause])))];

describe(compileMathExpression, () => {
  test.each([["The parity corpus matches mathjs's recorded answers"]])("%s", (_title) => {
    expect.hasAssertions();
    expect(mathjs).toBe("15.2.0");

    expect(getMismatches(entries.filter((entry) => entry.fix === undefined))).toStrictEqual([]);
  });

  // A fix row is a known difference from mathjs, pinned to our answer until its cause is fixed
  test.each(causes)("%s", (cause) => {
    expect.hasAssertions();

    expect(getMismatches(entries.filter((entry) => entry.fix?.cause === cause))).toStrictEqual([]);
  });
});
