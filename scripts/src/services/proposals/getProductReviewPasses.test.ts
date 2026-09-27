import { getProductReviewPasses } from "#src/services/proposals/getProductReviewPasses";
import { describe, expect, test } from "vitest";

describe(getProductReviewPasses, () => {
  const date = new Date(0).toISOString().slice(0, 10);
  const hash = "a";

  test("reads the areas a pass names before the dash", () => {
    expect.hasAssertions();

    expect(
      getProductReviewPasses(`${hash}\u001F0\u001F${date}\u001Fdocs(product-review): a, b and c — converged\u001E`),
    ).toStrictEqual([{ areas: ["a", "b", "c"], date, hash, timestamp: 0 }]);
  });

  // `--grep` matches a body that only mentions the prefix, which is no pass
  test("skips a commit whose subject is not a pass", () => {
    expect.hasAssertions();

    expect(getProductReviewPasses(`${hash}\u001F0\u001F${date}\u001Fdocs(a): b\u001E`)).toStrictEqual([]);
  });
});
