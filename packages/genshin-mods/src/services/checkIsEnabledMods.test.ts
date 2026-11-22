import { describe, expect, test } from "vitest";

import { checkIsEnabledMods } from "./checkIsEnabledMods";

describe(checkIsEnabledMods, () => {
  test("rejects a stored record with a mod flag that is not a boolean", () => {
    expect.hasAssertions();

    expect(checkIsEnabledMods({ resin: "yes" })).toBe(false);
  });
});
