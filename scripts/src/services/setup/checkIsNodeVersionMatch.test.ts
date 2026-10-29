import { checkIsNodeVersionMatch } from "#src/services/setup/checkIsNodeVersionMatch";
import { describe, expect, test } from "vitest";

describe(checkIsNodeVersionMatch, () => {
  test("matches node's own `v` prefix against a pin written without one", () => {
    expect.hasAssertions();

    expect(checkIsNodeVersionMatch("v26.13.0", "26.13.0\n")).toBe(true);
  });

  test("rejects a running node that is not the pinned patch release", () => {
    expect.hasAssertions();

    expect(checkIsNodeVersionMatch("v26.13.1", "26.13.0")).toBe(false);
  });
});
