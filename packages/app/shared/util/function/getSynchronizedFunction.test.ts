import { getSynchronizedFunction } from "#shared/util/function/getSynchronizedFunction";
import { describe, expect, test, vi } from "vitest";

describe(getSynchronizedFunction, () => {
  test("calls the original function with the forwarded arguments", () => {
    expect.hasAssertions();

    const originalFunction = vi.fn<(value: string) => Promise<string>>().mockResolvedValue("");

    getSynchronizedFunction(originalFunction)("");

    expect(originalFunction).toHaveBeenCalledExactlyOnceWith("");
  });
});
