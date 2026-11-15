import { createWorkerTimers } from "#src/services/shared/createWorkerTimers";
import { getWorkerTimers } from "#src/services/shared/getWorkerTimers";
import { noop } from "@esposter/shared";
import { afterEach, describe, expect, test, vi } from "vitest";

// The real timers over a target that takes nothing, so the test counts how often they are made
vi.mock(import("#src/services/shared/createWorkerTimers"), async (importOriginal) => {
  const { createWorkerTimers: createRealWorkerTimers } = await importOriginal();
  return {
    createWorkerTimers: vi.fn<typeof createWorkerTimers>(() =>
      createRealWorkerTimers({ addEventListener: noop, postMessage: noop }),
    ),
  };
});

describe(getWorkerTimers, () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  test("makes its worker on first use, once, and hands the same timers to every caller", () => {
    expect.hasAssertions();

    // The test environment has no Worker for the bundled timer worker to construct
    vi.stubGlobal("Worker", vi.fn<(scriptUrl: string | URL) => void>());

    expect(createWorkerTimers).not.toHaveBeenCalled();

    expect(getWorkerTimers()).toBe(getWorkerTimers());
    expect(createWorkerTimers).toHaveBeenCalledTimes(1);
  });
});
