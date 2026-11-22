import { describe, expect, test } from "vitest";

import { ModName } from "../models/ModName";
import { checkIsEnabledMods } from "./checkIsEnabledMods";

describe(checkIsEnabledMods, () => {
  test("rejects a stored record with a mod flag that is not a boolean", () => {
    expect.hasAssertions();

    expect(checkIsEnabledMods({ [ModName.Resin]: "" })).toBe(false);
  });
});
