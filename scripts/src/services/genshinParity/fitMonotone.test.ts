import { fitMonotone } from "#src/services/genshinParity/fitMonotone";
import { describe, expect, test } from "vitest";

describe(fitMonotone, () => {
  test("pools a falling run into its weighted mean and leaves a rising one", () => {
    expect.hasAssertions();

    expect(fitMonotone([0, 3, 1, 4], [1, 1, 3, 1])).toStrictEqual([0, 1.5, 1.5, 4]);
  });
});
