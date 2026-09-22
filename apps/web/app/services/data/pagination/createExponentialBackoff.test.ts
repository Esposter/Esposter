import { createExponentialBackoff } from "@/services/data/pagination/createExponentialBackoff";
import { afterEach, describe, expect, test, vi } from "vitest";

describe(createExponentialBackoff, () => {
  const baseDelayMs = 1;
  const maxDelayMs = 2;
  const value = "value";
  const error = new Error("");

  afterEach(() => {
    vi.restoreAllMocks();
  });

  test("executes immediately when there are no failures", async () => {
    expect.hasAssertions();

    const setTimeoutSpy = vi.spyOn(globalThis, "setTimeout");
    const executeWithBackoff = createExponentialBackoff(baseDelayMs, maxDelayMs);
    const operation = vi.fn<() => Promise<string>>(() => Promise.resolve(value));

    await expect(executeWithBackoff(operation)).resolves.toBe(value);
    expect(operation).toHaveBeenCalledTimes(1);
    expect(setTimeoutSpy).not.toHaveBeenCalled();
  });

  test("delays exponentially after consecutive failures up to maxDelayMs", async () => {
    expect.hasAssertions();

    const setTimeoutSpy = vi.spyOn(globalThis, "setTimeout");
    const executeWithBackoff = createExponentialBackoff(baseDelayMs, maxDelayMs);
    const operation = vi.fn<() => Promise<string>>(() => Promise.reject(error));

    await expect(executeWithBackoff(operation)).rejects.toThrowErrorMatchingInlineSnapshot(`[Error]`);
    expect(setTimeoutSpy).not.toHaveBeenCalled();

    // Second attempt waits baseDelayMs; third and fourth are capped at maxDelayMs (2 ** 1, then 2 ** 2 clamped)
    for (const expectedDelayMs of [baseDelayMs, maxDelayMs, maxDelayMs]) {
      await expect(executeWithBackoff(operation)).rejects.toThrowErrorMatchingInlineSnapshot(`[Error]`);
      expect(setTimeoutSpy.mock.lastCall?.[1]).toBe(expectedDelayMs);
    }

    expect(operation).toHaveBeenCalledTimes(4);
  });

  test("resets delay after success", async () => {
    expect.hasAssertions();

    const setTimeoutSpy = vi.spyOn(globalThis, "setTimeout");
    const executeWithBackoff = createExponentialBackoff(baseDelayMs, maxDelayMs);

    await expect(executeWithBackoff(() => Promise.reject(error))).rejects.toThrowErrorMatchingInlineSnapshot(`[Error]`);
    await expect(executeWithBackoff(() => Promise.resolve(value))).resolves.toBe(value);

    setTimeoutSpy.mockClear();

    await expect(executeWithBackoff(() => Promise.resolve(value))).resolves.toBe(value);
    expect(setTimeoutSpy).not.toHaveBeenCalled();
  });
});
