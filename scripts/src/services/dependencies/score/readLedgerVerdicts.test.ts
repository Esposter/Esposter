import { describe, expect, test } from "vitest";
import { readLedgerVerdicts } from "#src/services/dependencies/score/readLedgerVerdicts";

describe(readLedgerVerdicts, () => {
  test("maps each backticked package to its verdict cell, skipping the header and separator", () => {
    expect.hasAssertions();

    const ledger = [
      "# Dependencies",
      "",
      "| Package | Swept | Verdict | Reason |",
      "| ------- | ----- | ------- | ------ |",
      "| `alpha` | — | Keep — data | a word list |",
      "| `beta` | — | Absorb | a small helper |",
      "| `gamma` | — | — | not judged |",
    ].join("\n");

    expect(readLedgerVerdicts(ledger)).toStrictEqual(
      new Map([
        ["alpha", "Keep — data"],
        ["beta", "Absorb"],
        ["gamma", "—"],
      ]),
    );
  });
});
