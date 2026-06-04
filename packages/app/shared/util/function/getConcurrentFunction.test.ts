import { getConcurrentFunction } from "#shared/util/function/getConcurrentFunction";
import { assert, describe, expect, test, vi } from "vitest";

describe(getConcurrentFunction, () => {
  test("passes args to the wrapped function", async () => {
    expect.hasAssertions();

    const fn = vi
      .fn<(checkIsStale: () => boolean, a: number, b: string) => Promise<void>>()
      .mockResolvedValue(undefined);
    const concurrentFn = getConcurrentFunction(fn);

    await concurrentFn(0, "");

    expect(fn).toHaveBeenCalledWith(expect.any(Function), 0, "");
  });

  test("checkIsStale returns false when no newer call has been made", async () => {
    expect.hasAssertions();

    let checkIsStale: (() => boolean) | undefined;
    const concurrentFn = getConcurrentFunction(async (check) => {
      checkIsStale = check;
    });

    await concurrentFn();

    assert.exists(checkIsStale);

    expect(checkIsStale()).toBe(false);
  });

  test("checkIsStale returns true for an earlier call after a newer call has been made", async () => {
    expect.hasAssertions();

    let firstCheckIsStale: (() => boolean) | undefined;
    const concurrentFn = getConcurrentFunction(async (checkIsStale) => {
      firstCheckIsStale ??= checkIsStale;
    });

    await concurrentFn();
    await concurrentFn();

    assert.exists(firstCheckIsStale);

    expect(firstCheckIsStale()).toBe(true);
  });

  test("checkIsStale returns false for the most recent call", async () => {
    expect.hasAssertions();

    let lastCheckIsStale: (() => boolean) | undefined;
    const concurrentFn = getConcurrentFunction(async (checkIsStale) => {
      lastCheckIsStale = checkIsStale;
    });

    await concurrentFn();
    await concurrentFn();

    assert.exists(lastCheckIsStale);

    expect(lastCheckIsStale()).toBe(false);
  });
});
