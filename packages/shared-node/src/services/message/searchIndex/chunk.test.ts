import { chunk } from "@/services/message/searchIndex/chunk";
import { describe, expect, test } from "vitest";

describe(chunk, () => {
  test("splits an array into batches of the given size with a trailing remainder", () => {
    expect.hasAssertions();

    expect(chunk([0, 1, 2], 2)).toStrictEqual([[0, 1], [2]]);
  });

  test("returns an empty array for an empty input", () => {
    expect.hasAssertions();

    expect(chunk([], 1)).toStrictEqual([]);
  });
});
