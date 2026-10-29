import type { KitOverlay } from "#src/models/genshinAssets/kits/KitOverlay";

import { KitProvisionalCause } from "#src/models/genshinAssets/kits/KitProvisionalCause";
import { KitSource } from "#src/models/genshinAssets/kits/KitSource";
import { OPEN_CELL } from "#src/services/sweeps/ledgerCoverage/constants";
import { EPOCH_DATE } from "#src/services/sweeps/ledgerCoverage/constants.test";
import { getSweptKitsHoldingUnclassified } from "#src/services/sweeps/ledgerCoverage/getSweptKitsHoldingUnclassified";
import { describe, expect, test } from "vitest";

const getRow = (unit: string, swept: string) => `| \`${unit}\` | ${swept} | |\n`;

describe(getSweptKitsHoldingUnclassified, () => {
  const header = `| Unit  | Swept      | Notes |
| ----- | ---------- | ----- |
`;
  const date = EPOCH_DATE;
  const unclassifiedOverlay: KitOverlay = { "a.b": { cause: KitProvisionalCause.Unclassified, value: 0 } };
  const classifiedOverlay: KitOverlay = {
    "a.b": { cause: KitProvisionalCause.Unsourced, value: 0 },
    "a.c": { source: KitSource.Gcsim, value: 1 },
  };

  test("names a dated row whose overlay still holds an Unclassified entry", () => {
    expect.hasAssertions();

    expect(getSweptKitsHoldingUnclassified(`${header}${getRow("a", date)}`, () => unclassifiedOverlay)).toStrictEqual([
      "a",
    ]);
  });

  test("names a dated row written without its backticks", () => {
    expect.hasAssertions();

    expect(getSweptKitsHoldingUnclassified(`${header}| a | ${date} | |\n`, () => unclassifiedOverlay)).toStrictEqual([
      "a",
    ]);
  });

  test("passes a dated row whose entries all have a cause or a source", () => {
    expect.hasAssertions();

    expect(getSweptKitsHoldingUnclassified(`${header}${getRow("a", date)}`, () => classifiedOverlay)).toStrictEqual([]);
  });

  test("passes an open row, whatever its overlay holds", () => {
    expect.hasAssertions();

    expect(
      getSweptKitsHoldingUnclassified(`${header}${getRow("a", OPEN_CELL)}`, () => unclassifiedOverlay),
    ).toStrictEqual([]);
  });

  test("reads each row's own overlay", () => {
    expect.hasAssertions();

    expect(
      getSweptKitsHoldingUnclassified(
        `${header}${getRow("a", date)}${getRow("b", date)}${getRow("c", OPEN_CELL)}`,
        (kit) => (kit === "b" ? unclassifiedOverlay : classifiedOverlay),
      ),
    ).toStrictEqual(["b"]);
  });
});
