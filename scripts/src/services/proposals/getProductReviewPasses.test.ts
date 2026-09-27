import { getProductReviewPasses } from "#src/services/proposals/getProductReviewPasses";
import { describe, expect, test } from "vitest";

describe(getProductReviewPasses, () => {
  const date = "1970-01-01";

  test("reads the areas a pass names before the dash", () => {
    expect.hasAssertions();

    expect(
      getProductReviewPasses(`0\u001F${date}\u001Fdocs(product-review): a, b and c — converged\u001E`),
    ).toStrictEqual([{ areas: ["a", "b", "c"], date, timestamp: 0 }]);
  });

  // `--grep` matches a body that only mentions the prefix, which is no pass
  test("skips a commit whose subject is not a pass", () => {
    expect.hasAssertions();

    expect(getProductReviewPasses(`0\u001F${date}\u001Fdocs(a): b\u001E`)).toStrictEqual([]);
  });
});
