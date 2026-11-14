import type { KeyedCanonicalRow } from "#src/models/cutover/KeyedCanonicalRow";

import { findFirstDifference } from "#src/services/cutover/verify/findFirstDifference";
import { describe, expect, test } from "vitest";

describe(findFirstDifference, () => {
  const toIterator = (rows: KeyedCanonicalRow[]) =>
    (async function* () {
      yield* rows;
    })();

  test("reports nothing when both sides hold the same rows in the same order", async () => {
    expect.hasAssertions();

    const rows = [{ canonical: "[1]", key: ["a"] }];

    expect(await findFirstDifference(toIterator(rows), toIterator(rows))).toBeUndefined();
  });

  test("names the first key whose values differ", async () => {
    expect.hasAssertions();

    const difference = await findFirstDifference(
      toIterator([
        { canonical: "[1]", key: ["a"] },
        { canonical: "[2]", key: ["b"] },
      ]),
      toIterator([
        { canonical: "[1]", key: ["a"] },
        { canonical: "[3]", key: ["b"] },
      ]),
    );

    expect(difference).toStrictEqual({ key: ["b"], reason: "differs" });
  });

  test("names a row only the target holds", async () => {
    expect.hasAssertions();

    const difference = await findFirstDifference(toIterator([]), toIterator([{ canonical: "[1]", key: ["a"] }]));

    expect(difference).toStrictEqual({ key: ["a"], reason: "missing in source" });
  });
});
