import { createBatchedRefresh } from "@/services/shared/createBatchedRefresh";
import { describe, expect, test, vi } from "vitest";

describe(createBatchedRefresh, () => {
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

    const consoleError = vi.spyOn(console, "error").mockImplementation(() => undefined);
    const refreshedKeys: string[][] = [];
    const markChanged = createBatchedRefresh(async (keys: string[]) => {
      refreshedKeys.push(keys);
      if (refreshedKeys.length === 1) throw new Error(" ");
    });
    await markChanged([""]);
    await markChanged([" "]);

    expect(refreshedKeys).toStrictEqual([[""], ["", " "]]);
    expect(consoleError).toHaveBeenCalledOnce();
  });
});
