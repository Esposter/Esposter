import { getIsServer } from "@/util/environment/getIsServer";
import { describe, expect, test, vi } from "vitest";

describe(getIsServer, () => {
  test("gets is server", () => {
    expect.hasAssertions();

    expect(getIsServer()).toBe(true);

    vi.stubGlobal("window", {});

    expect(getIsServer()).toBe(false);

    vi.unstubAllGlobals();
  });
});
