import { createBatchedRefresh } from "@/services/shared/createBatchedRefresh";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";

describe(createBatchedRefresh, () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.spyOn(console, "error").mockImplementation(() => undefined);
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  test("a key marked while a run is in flight is read by the run owed after it", async () => {
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
    await firstChange;
    await secondChange;

    expect(refreshedKeys).toStrictEqual([[""], [" "]]);
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

  test("a key marked again while the run that reads it is in flight is read once more", async () => {
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
    const secondChange = markChanged([""]);
    releaseFirst();
    await firstChange;
    await secondChange;

    expect(refreshedKeys).toStrictEqual([[""], [""]]);
  });

  test("a failed run puts its keys back for the next mark to read", async () => {
    expect.hasAssertions();

    const refreshedKeys: string[][] = [];
    const markChanged = createBatchedRefresh(async (keys: string[]) => {
      refreshedKeys.push(keys);
      if (refreshedKeys.length === 1) throw new Error(" ");
    });
    await markChanged([""]);
    const secondChange = markChanged([" "]);
    await vi.runAllTimersAsync();
    await secondChange;

    expect(refreshedKeys).toStrictEqual([[""], ["", " "]]);
    expect(console.error).toHaveBeenCalledOnce();
  });

  test("a failed run is read again without a mark, after the backoff", async () => {
    expect.hasAssertions();

    const refreshedKeys: string[][] = [];
    const markChanged = createBatchedRefresh(async (keys: string[]) => {
      refreshedKeys.push(keys);
      if (refreshedKeys.length === 1) throw new Error(" ");
    });
    await markChanged([""]);
    await vi.runAllTimersAsync();

    expect(refreshedKeys).toStrictEqual([[""], [""]]);
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
    await vi.runAllTimersAsync();
    await markedAgain;

    expect(refresh).toHaveBeenLastCalledWith(["", " "]);
  });
});
