import { getAreaUnitSizeFindings } from "#src/services/precheck/getAreaUnitSizeFindings";
import { LEDGER_AREA_DIRECTORY } from "#src/services/sweeps/constants";
import { UNIT_FILE_CAP, UNIT_LINE_CAP } from "#src/services/sweeps/ledgerCoverage/constants";
import { describe, expect, test } from "vitest";

describe(getAreaUnitSizeFindings, () => {
  const unit = "`a`";
  const area = "a";
  // A unit of `files` files, where the first holds all `lines` of code and the rest hold none
  const getFindings = (files: number, lines: number) => {
    const paths = Array.from({ length: files }, (_value, index) => `f${index}.ts`);
    return getAreaUnitSizeFindings({ [area]: [unit] }, [], new Map([[unit, paths]]), (path) => ({
      files: 1,
      lines: path === "f0.ts" ? lines : 0,
    }));
  };

  test("finds nothing for a unit at the cap", () => {
    expect.hasAssertions();

    expect(getFindings(UNIT_FILE_CAP, UNIT_LINE_CAP)).toStrictEqual([]);
  });

  test.each([
    [UNIT_FILE_CAP + 1, 0],
    [1, UNIT_LINE_CAP + 1],
  ])("names a unit past the cap at %i files and %i code lines", (files, lines) => {
    expect.hasAssertions();

    expect(getFindings(files, lines)).toStrictEqual([
      `oversized unit ${unit} in ${LEDGER_AREA_DIRECTORY}/${area}.md: ${files} files and ${lines} code lines, past the cap of ${UNIT_FILE_CAP} files and ${UNIT_LINE_CAP} lines, so split it at its directory boundaries`,
    ]);
  });
});
