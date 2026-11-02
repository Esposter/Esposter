// @vitest-environment nuxt
import { mountSuspended } from "@nuxt/test-utils/runtime";
import { afterEach, describe, expect, test, vi } from "vitest";

// The timer worker needs a Web Worker, which the test environment has no equivalent for — the
// Delegation keeps the composable's own scheduling under vitest's fake timers
vi.mock(import("@/services/shared/getWorkerTimers"), () => import("@/services/shared/getWorkerTimersStandIn.test"));

describe(useWorkerInterval, () => {
  const intervalMs = 1;

  afterEach(() => {
    vi.useRealTimers();
  });

  test("stops calling back once the component unmounts", async () => {
    expect.hasAssertions();

    const callback = vi.fn<() => void>();
    vi.useFakeTimers();
    const wrapper = await mountSuspended(
      defineComponent({
        render: () => h("div"),
        setup: () => {
          useWorkerInterval(callback, intervalMs);
        },
      }),
    );
    vi.advanceTimersByTime(intervalMs);

    expect(callback).toHaveBeenCalledTimes(1);

    wrapper.unmount();
    vi.advanceTimersByTime(intervalMs);

    expect(callback).toHaveBeenCalledTimes(1);
  });
});
