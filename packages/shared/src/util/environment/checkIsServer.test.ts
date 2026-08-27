import { checkIsServer } from "#src/util/environment/checkIsServer";
import { describe, expect, test, vi } from "vitest";

describe(checkIsServer, () => {
  test("gets is server", () => {
    expect.hasAssertions();

    expect(checkIsServer()).toBe(true);

    vi.stubGlobal("window", {});

    expect(checkIsServer()).toBe(false);

    vi.unstubAllGlobals();
  });
});
