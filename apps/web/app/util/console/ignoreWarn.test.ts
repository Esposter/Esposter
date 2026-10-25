import { ignoreWarn } from "@/util/console/ignoreWarn";
import { noop } from "@esposter/shared";
import { afterEach, describe, expect, test, vi } from "vitest";

describe(ignoreWarn, () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  test("silences console.warn while the callback runs", () => {
    expect.hasAssertions();

    const warn = vi.spyOn(console, "warn").mockImplementation(noop);
    ignoreWarn(() => {
      console.warn();
    });

    expect(warn).not.toHaveBeenCalled();
  });

  test("restores console.warn once the callback returns", () => {
    expect.hasAssertions();

    const warn = vi.spyOn(console, "warn").mockImplementation(noop);
    ignoreWarn(noop);
    console.warn("after");

    expect(warn).toHaveBeenCalledExactlyOnceWith("after");
  });
});
