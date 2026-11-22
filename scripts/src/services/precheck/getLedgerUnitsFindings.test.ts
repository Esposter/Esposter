import { getLedgerUnitsFindings } from "#src/services/precheck/getLedgerUnitsFindings";
import { LEDGER_DIRECTORY } from "#src/services/sweeps/constants";
import { describe, expect, test } from "vitest";

describe(getLedgerUnitsFindings, () => {
  const header = `| Unit | Notes |
| ---- | ----- |
`;
  const getText = (unit: string) => `${header}| ${unit} | b |\n`;

  test("finds nothing when every row names a unit the tree derives", () => {
    expect.hasAssertions();

    expect(getLedgerUnitsFindings(() => getText("`a`"), { derived: () => ["`a`", "`c`"] })).toStrictEqual([]);
  });

  test("finds nothing for a derived ledger with no file", () => {
    expect.hasAssertions();

    expect(getLedgerUnitsFindings(() => "", { derived: () => ["`a`"] })).toStrictEqual([]);
  });

  test("names a row whose unit the tree no longer derives", () => {
    expect.hasAssertions();

    expect(getLedgerUnitsFindings(() => getText("`a`"), { derived: () => ["`c`"] })).toStrictEqual([
      `stale row \`a\` in ${LEDGER_DIRECTORY}/derived.md: no unit the tree derives, so remove it`,
    ]);
  });
});
