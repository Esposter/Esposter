import { checkIsServer } from "#src/util/environment/checkIsServer";
import { afterEach, describe, expect, test, vi } from "vitest";

describe(checkIsServer, () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  test("gets is server", () => {
    expect.hasAssertions();

    expect(checkIsServer()).toBe(true);

    vi.stubGlobal("window", {});

    expect(checkIsServer()).toBe(false);
  });
});
