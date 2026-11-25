import { BATCHED_REFRESH_MAX_DELAY_MS } from "#src/services/shared/constants";
import { createBatchedRefresh } from "#src/services/shared/createBatchedRefresh";
import { getSynchronizedFunction, waitForSynchronizedFunctions } from "@esposter/shared";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";

describe(createBatchedRefresh, () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.spyOn(console, "error").mockReturnValue(undefined);
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  test("a mark made while a run is in flight resolves once the run owed after it has read the key", async () => {
    expect.hasAssertions();

    const { promise: releaseFirstRun, resolve: releaseFirst } = Promise.withResolvers<void>();
    const { promise: firstRunStarted, resolve: markFirstRunStarted } = Promise.withResolvers<void>();
    const refreshedKeys: string[][] = [];
    const markChanged = createBatchedRefresh(async (keys: string[]) => {
      refreshedKeys.push(keys);
      if (refreshedKeys.length === 1) {
        markFirstRunStarted();
        await releaseFirstRun;
      }
    });
    const firstChange = markChanged([""]);
    await firstRunStarted;
    const secondChange = markChanged([" "]);
    releaseFirst();
    await secondChange;

    expect(refreshedKeys).toStrictEqual([[""], [" "]]);
    await firstChange;
  });

  test("a failed run puts its keys back for the next mark to read", async () => {
    expect.hasAssertions();

    const refreshedKeys: string[][] = [];
    const markChanged = createBatchedRefresh((keys: string[]) => {
      refreshedKeys.push(keys);
      return refreshedKeys.length === 1 ? Promise.reject(new Error(" ")) : Promise.resolve();
    });
    await markChanged([""]);
    const secondChange = markChanged([" "]);
    await vi.runAllTimersAsync();
    await secondChange;

    expect(refreshedKeys).toStrictEqual([[""], ["", " "]]);
    expect(console.error).toHaveBeenCalledTimes(1);
  });

  test("a failed run is read again without a mark, after the backoff", async () => {
    expect.hasAssertions();

    const refreshedKeys: string[][] = [];
    const markChanged = createBatchedRefresh((keys: string[]) => {
      refreshedKeys.push(keys);
      return refreshedKeys.length === 1 ? Promise.reject(new Error(" ")) : Promise.resolve();
    });
    await markChanged([""]);
    await vi.runAllTimersAsync();

    expect(refreshedKeys).toStrictEqual([[""], [""]]);
  });

  test("a drain waits for the retry a failed run scheduled", async () => {
    expect.hasAssertions();

    const refreshedKeys: string[][] = [];
    const markChanged = createBatchedRefresh((keys: string[]) => {
      refreshedKeys.push(keys);
      return refreshedKeys.length === 1 ? Promise.reject(new Error(" ")) : Promise.resolve();
    });
    getSynchronizedFunction(() => markChanged([""]))();
    const drainedKeys = (async () => {
      await waitForSynchronizedFunctions();
      return [...refreshedKeys];
    })();
    await vi.runAllTimersAsync();

    await expect(drainedKeys).resolves.toStrictEqual([[""], [""]]);
  });

  test("a run that keeps failing stops retrying at the cap, and the next mark reads again", async () => {
    expect.hasAssertions();

    const refresh = vi.fn<(keys: string[]) => Promise<void>>(() => Promise.reject(new Error(" ")));
    const markChanged = createBatchedRefresh(refresh);
    await markChanged([""]);
    await vi.runAllTimersAsync();

    expect(refresh).toHaveBeenCalledTimes(6);

    refresh.mockResolvedValueOnce(undefined);
    const markedAgain = markChanged([" "]);
    // The wait does not reset at the cap, so the mark's read is held for the whole maximum
    await vi.advanceTimersByTimeAsync(BATCHED_REFRESH_MAX_DELAY_MS - 1);
    expect(refresh).toHaveBeenCalledTimes(6);
    await vi.runAllTimersAsync();
    await markedAgain;

    expect(refresh).toHaveBeenLastCalledWith(["", " "]);
  });
});
