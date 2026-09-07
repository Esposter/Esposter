import { getSynchronizedFunction, waitForSynchronizedFunctions } from "#shared/util/function/getSynchronizedFunction";
import { describe, expect, test, vi } from "vitest";

describe(getSynchronizedFunction, () => {
  test("calls the original function with the forwarded arguments", () => {
    expect.hasAssertions();

    const originalFunction = vi.fn<(value: string) => Promise<string>>().mockResolvedValue("");

    getSynchronizedFunction(originalFunction)("");

    expect(originalFunction).toHaveBeenCalledExactlyOnceWith("");
  });

  // The wrapper reports a rejection nowhere and the drain settles it away, so a callback that does not
  // Terminate its own Result fails in total silence — which is why every call site wraps its own body
  test("reports nothing when the original function rejects", async () => {
    expect.hasAssertions();

    const originalFunction = vi.fn<() => Promise<void>>().mockRejectedValue(new Error("rejected"));

    getSynchronizedFunction(originalFunction)();

    await expect(waitForSynchronizedFunctions()).resolves.toBeUndefined();
  });
});
