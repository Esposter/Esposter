import { getQuestionUnits } from "#src/services/sweeps/ledgerCoverage/getQuestionUnits";
import { getUnitFiles } from "#src/services/sweeps/ledgerCoverage/getUnitFiles";
import { describe, expect, test } from "vitest";

describe(getQuestionUnits, () => {
  test("holds a question to the units that hold one of its in-scope files", () => {
    expect.hasAssertions();

    const units = ["`a/x.ts`", "`a/b`", "`e` — the rest"];
    const unitFiles = getUnitFiles(units, ["a/x.ts", "a/b/y.ts", "e/g/h.ts"]);

    expect(getQuestionUnits(units, unitFiles, new Set(["a/x.ts", "e/g/h.ts"]))).toStrictEqual([
      "`a/x.ts`",
      "`e` — the rest",
    ]);
  });
});
