import { getSynchronizedFunction } from "#shared/util/function/getSynchronizedFunction";
import { describe, expect, test, vi } from "vitest";

describe(getSynchronizedFunction, () => {
  test("calls the original function with the forwarded arguments", () => {
    expect.hasAssertions();

    const fn = vi.fn<(value: string) => Promise<string>>().mockResolvedValue("");

    getSynchronizedFunction(fn)("");

    expect(fn).toHaveBeenCalledExactlyOnceWith("");
  });

  test("returns undefined instead of the original promise", () => {
    expect.hasAssertions();

    const fn = vi.fn<() => Promise<string>>().mockResolvedValue("");

    expect(getSynchronizedFunction(fn)()).toBeUndefined();
  });
});
