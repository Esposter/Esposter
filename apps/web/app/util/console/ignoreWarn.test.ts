import { ignoreWarn } from "@/util/console/ignoreWarn";
import { noop } from "@esposter/shared";
import { afterEach, describe, expect, test, vi } from "vitest";

describe(ignoreWarn, () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  test("ignores warn", () => {
    expect.hasAssertions();

    const warn = vi.spyOn(console, "warn").mockImplementation(noop);
    ignoreWarn(() => {
      console.warn();
    });

    expect(warn).not.toHaveBeenCalled();
  });
});
