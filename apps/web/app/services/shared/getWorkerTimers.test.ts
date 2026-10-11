import { createWorkerTimers } from "@/services/shared/createWorkerTimers";
import { getWorkerTimers } from "@/services/shared/getWorkerTimers";
import { noop } from "@esposter/shared";
import { describe, expect, test, vi } from "vitest";

// The real timers over a target that takes nothing, so the test counts how often they are made
vi.mock(import("@/services/shared/createWorkerTimers"), async (importOriginal) => {
  const { createWorkerTimers: createRealWorkerTimers } = await importOriginal();
  return {
    createWorkerTimers: vi.fn<typeof createWorkerTimers>(() =>
      createRealWorkerTimers({ addEventListener: noop, postMessage: noop }),
    ),
  };
});
vi.mock(import("@/workers/shared/timer.worker?worker"), () => ({ default: vi.fn<() => Worker>() }));

describe(getWorkerTimers, () => {
  test("makes its worker on first use, once, and hands the same timers to every caller", () => {
    expect.hasAssertions();
    expect(createWorkerTimers).not.toHaveBeenCalled();

    expect(getWorkerTimers()).toBe(getWorkerTimers());
    expect(createWorkerTimers).toHaveBeenCalledTimes(1);
  });
});
