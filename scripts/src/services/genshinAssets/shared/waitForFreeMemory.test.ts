import type { readAvailableGigabytes as baseReadAvailableGigabytes } from "#src/services/machine/readAvailableGigabytes";
import type { setTimeout as baseSleep } from "node:timers/promises";

import { waitForFreeMemory } from "#src/services/genshinAssets/shared/waitForFreeMemory";
import { MEMORY_WAIT_MILLISECONDS, MIN_AVAILABLE_MEMORY_GIGABYTES } from "#src/services/genshinAssets/world/constants";
import { noop } from "@esposter/shared";
import { afterEach, describe, expect, test, vi } from "vitest";

const { readAvailableGigabytes, sleep } = vi.hoisted(() => ({
  readAvailableGigabytes: vi.fn<typeof baseReadAvailableGigabytes>(),
  sleep: vi.fn<typeof baseSleep>(),
}));

vi.mock(import("#src/services/machine/readAvailableGigabytes"), () => ({
  readAvailableGigabytes: readAvailableGigabytes as typeof baseReadAvailableGigabytes,
}));
// The wait is a clock, which fake timers do not reach through node:timers/promises, so the sleep itself is the double
vi.mock(import("node:timers/promises"), () => ({ setTimeout: sleep as typeof baseSleep }));

describe(waitForFreeMemory, () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  test("returns at once, with one warning, when available memory cannot be read", async () => {
    expect.hasAssertions();

    const warn = vi.spyOn(console, "warn").mockImplementation(noop);
    readAvailableGigabytes.mockResolvedValueOnce(undefined);

    await waitForFreeMemory();

    expect(readAvailableGigabytes).toHaveBeenCalledTimes(1);
    expect(sleep).not.toHaveBeenCalled();
    expect(warn).toHaveBeenCalledTimes(1);
  });

  test("waits once when a low reading is followed by a high one", async () => {
    expect.hasAssertions();

    readAvailableGigabytes
      .mockResolvedValueOnce(MIN_AVAILABLE_MEMORY_GIGABYTES - 1)
      .mockResolvedValueOnce(MIN_AVAILABLE_MEMORY_GIGABYTES);
    sleep.mockResolvedValueOnce(undefined);

    await waitForFreeMemory();

    expect(readAvailableGigabytes).toHaveBeenCalledTimes(2);
    expect(sleep).toHaveBeenCalledExactlyOnceWith(MEMORY_WAIT_MILLISECONDS);
  });
});
