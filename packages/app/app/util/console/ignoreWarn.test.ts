import { ignoreWarn } from "@/util/console/ignoreWarn";
import { describe, expect, test, vi } from "vitest";

describe(ignoreWarn, () => {
  test("ignores warn", () => {
    expect.hasAssertions();

    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    ignoreWarn(() => console.warn());

    expect(warn).not.toHaveBeenCalled();

    warn.mockRestore();
  });
});
