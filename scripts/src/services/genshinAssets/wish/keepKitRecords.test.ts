import { keepKitRecords } from "#src/services/genshinAssets/wish/keepKitRecords";
import { describe, expect, test } from "vitest";

describe(keepKitRecords, () => {
  test("a name joining several records keeps the one with a kit of its own", () => {
    expect.hasAssertions();

    expect(keepKitRecords([1, 2], (id) => id === 2)).toStrictEqual([2]);
  });

  test("a name joining records with no kit keeps every record it joins", () => {
    expect.hasAssertions();

    expect(keepKitRecords([1, 2], () => false)).toStrictEqual([1, 2]);
  });
});
