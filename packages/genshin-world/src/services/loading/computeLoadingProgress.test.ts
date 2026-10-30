import { computeLoadingProgress } from "#src/services/loading/computeLoadingProgress";
import { LOADING_BYTES_SHARE } from "#src/services/loading/constants";
import { describe, expect, test } from "vitest";

describe(computeLoadingProgress, () => {
  test("size shows beside the bar while bytes are pending", () => {
    expect.hasAssertions();

    expect(computeLoadingProgress(0, 1, 1)).toBe(LOADING_BYTES_SHARE);
  });

  test("nothing pending shows no size", () => {
    expect.hasAssertions();

    expect(computeLoadingProgress(1 / 3, 0, 0)).toBe(1 / 3);
  });
});
