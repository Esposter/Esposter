import { defaults } from "#src/defaults";
import { describe, expect, test } from "vitest";

describe("defaults", () => {
  // Issue #536: the defaults were a mutable object, so one caller's change reached every parser created after it
  test("freezes the defaults at every depth", () => {
    expect.hasAssertions();

    expect(Object.isFrozen(defaults["0.2"])).toBe(true);
    expect(Object.isFrozen(defaults["0.2"].renderOpts)).toBe(true);
    expect(Object.isFrozen(defaults["0.2"].xmldec)).toBe(true);
  });
});
