import { getSynchronizedFunction } from "#shared/util/getSynchronizedFunction";
import { describe, expect, test, vi } from "vitest";

describe(getSynchronizedFunction, () => {
  test("calls the original function", async () => {
    expect.hasAssertions();

    const value = true;
    const fn = vi.fn<() => Promise<boolean>>().mockResolvedValue(value);
    const synchronizedFunction = getSynchronizedFunction(fn);

    synchronizedFunction();

    await expect(fn.apply(this)).resolves.toBe(value);
  });
});
