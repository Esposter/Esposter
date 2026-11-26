import { checkLedgerRows } from "#src/services/precheck/checkLedgerRows";
import { PRECHECK_FIX_FINDING } from "#src/services/precheck/constants";
import { LEDGER_DIRECTORY } from "#src/services/sweeps/constants";
import { describe, expect, test } from "vitest";

describe(checkLedgerRows, () => {
  const header = `| Unit | Notes |
| ---- | ----- |
`;
  const label = `${LEDGER_DIRECTORY}/derived.md`;
  const rewordedUnit = "`a` — `b`";
  const getText = (unit: string) => `${header}| ${unit} | c |\n`;

  test("finds nothing when every row names a unit the tree derives", () => {
    expect.hasAssertions();

    expect(checkLedgerRows(() => getText("`a`"), { derived: () => ["`a`", "`c`"] })).toStrictEqual({
      findings: [],
      regenerated: [],
    });
  });

  test("finds nothing for a derived ledger with no file", () => {
    expect.hasAssertions();

    expect(checkLedgerRows(() => "", { derived: () => ["`a`"] }).findings).toStrictEqual([]);
  });

  test("names a row whose unit the tree no longer derives", () => {
    expect.hasAssertions();

    expect(checkLedgerRows(() => getText("`a`"), { derived: () => ["`c`"] }).findings).toStrictEqual([
      `stale row \`a\` in ${label}: no unit the tree derives, so remove it`,
    ]);
  });

  test("names the unit a reworded row became, and the fix that rewrites it", () => {
    expect.hasAssertions();

    expect(checkLedgerRows(() => getText(rewordedUnit), { derived: () => ["`a`"] }).findings).toStrictEqual([
      `stale row ${rewordedUnit} in ${label}: now \`a\``,
      PRECHECK_FIX_FINDING,
    ]);
  });

  test("rewrites a reworded row to the unit it became under fix", () => {
    expect.hasAssertions();

    const written: string[] = [];

    expect(
      checkLedgerRows(
        () => getText(rewordedUnit),
        { derived: () => ["`a`"] },
        (_ledger, text) => written.push(text),
      ),
    ).toStrictEqual({ findings: [], regenerated: [label] });
    expect(written).toStrictEqual([getText("`a`")]);
  });

  // Two units now start where the row did, so which one it became is a person's call
  test("leaves a reworded row to a person when several units start at its path", () => {
    expect.hasAssertions();

    expect(
      checkLedgerRows(() => getText(rewordedUnit), { derived: () => ["`a` — `b`, `c`", "`a` — `d`"] }).findings,
    ).toStrictEqual([`stale row ${rewordedUnit} in ${label}: no unit the tree derives, so remove it`]);
  });
});
