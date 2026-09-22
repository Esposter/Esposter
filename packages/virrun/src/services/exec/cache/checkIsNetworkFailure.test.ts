import { checkIsNetworkFailure } from "#src/services/exec/cache/checkIsNetworkFailure";
import { describe, expect, test } from "vitest";

describe(checkIsNetworkFailure, () => {
  test.each(["fetch failed", "ENOTFOUND", "ECONNREFUSED", "ENETUNREACH"])(
    "flags the network-failure signature in %j",
    (output) => {
      expect.hasAssertions();

      expect(checkIsNetworkFailure(output)).toBe(true);
    },
  );

  test.each(["", "a"])("does not flag the non-network output %j", (output) => {
    expect.hasAssertions();

    expect(checkIsNetworkFailure(output)).toBe(false);
  });
});
