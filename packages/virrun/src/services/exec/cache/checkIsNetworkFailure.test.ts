import { checkIsNetworkFailure } from "#src/services/exec/cache/checkIsNetworkFailure";
import { describe, expect, test } from "vitest";

describe(checkIsNetworkFailure, () => {
  test.each([
    "│ @pnpm/pacquet    │ fetch failed │",
    "Error: getaddrinfo ENOTFOUND registry.npmjs.org",
    "connect ECONNREFUSED 127.0.0.1:443",
    "request to https://registry.npmjs.org failed, reason: ENETUNREACH",
  ])("flags the network-failure signature in %j", (output) => {
    expect.hasAssertions();

    expect(checkIsNetworkFailure(output)).toBe(true);
  });

  test.each(["", "TypeError: cannot read property 'x' of undefined", "1 error found in foo.ts"])(
    "does not flag the non-network output %j",
    (output) => {
      expect.hasAssertions();

      expect(checkIsNetworkFailure(output)).toBe(false);
    },
  );
});
