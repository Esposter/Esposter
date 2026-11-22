import { matchLedgerJudgement } from "#src/services/sweeps/ledgerCoverage/matchLedgerJudgement";
import { describe, expect, test } from "vitest";

describe(matchLedgerJudgement, () => {
  const sampledUnits = ["a/b — x.ts, y.ts", "a/c", "a/d — z.ts"];

  test.each([
    ["the unit as the sample spells it", "a/d — z.ts", "a/d — z.ts"],
    ["a unit the reader shortened to its path", "a/b", "a/b — x.ts, y.ts"],
  ])("maps %s to its sampled unit", (_description, unit, expected) => {
    expect.hasAssertions();

    expect(matchLedgerJudgement(sampledUnits, unit, "01.jsonl:1")).toBe(expected);
  });

  test("names the judgement's location when no sampled unit begins with the path", () => {
    expect.hasAssertions();

    expect(() => matchLedgerJudgement(sampledUnits, "a/x", "01.jsonl:1")).toThrowErrorMatchingInlineSnapshot(
      `[InvalidOperationError: Invalid operation: Read, name: 01.jsonl:1, a/x matches 0 sampled units]`,
    );
  });

  test("names the judgement's location when several sampled units begin with the path", () => {
    expect.hasAssertions();

    expect(() =>
      matchLedgerJudgement(["a/b — x.ts", "a/b — y.ts"], "a/b", "01.jsonl:1"),
    ).toThrowErrorMatchingInlineSnapshot(
      `[InvalidOperationError: Invalid operation: Read, name: 01.jsonl:1, a/b matches 2 sampled units]`,
    );
  });
});
