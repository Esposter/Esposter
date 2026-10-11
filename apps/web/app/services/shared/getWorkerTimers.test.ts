import { createWorkerTimers } from "@/services/shared/createWorkerTimers";
import { getWorkerTimers } from "@/services/shared/getWorkerTimers";
import { describe, expect, test, vi } from "vitest";

vi.mock(import("@/services/shared/createWorkerTimers"), () => ({
  createWorkerTimers: vi.fn<() => object>(() => ({})),
}));
vi.mock(import("@/workers/shared/timer.worker?worker"), () => ({
  default: class TimerWorkerStub extends EventTarget {},
}));

describe(getWorkerTimers, () => {
  test("makes its worker on first use, once, and hands the same timers to every caller", () => {
    expect.hasAssertions();
    expect(createWorkerTimers).not.toHaveBeenCalled();

    expect(getWorkerTimers()).toBe(getWorkerTimers());
    expect(createWorkerTimers).toHaveBeenCalledTimes(1);
  });
});
