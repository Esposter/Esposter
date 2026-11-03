import type { UseRegisterSW } from "#src/runtime/models/UseRegisterSW";

import { createPwaPlugin } from "#src/runtime/createPwaPlugin";
import { noop, waitForSynchronizedFunctions } from "@esposter/shared";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";
import { ref } from "vue";

vi.mock(import("nuxt/app"), () => ({ defineNuxtPlugin: (plugin: unknown) => plugin }) as never);

describe(createPwaPlugin, () => {
  const PERIOD_SECONDS = 3600;

  const registerWorker = (registration: Partial<ServiceWorkerRegistration>): void => {
    const useRegisterSW = vi.fn<UseRegisterSW>(({ onRegisteredSW }) => {
      onRegisteredSW("/sw.js", registration as ServiceWorkerRegistration);
      return { needRefresh: ref(false), offlineReady: ref(false), updateServiceWorker: () => Promise.resolve() };
    });
    const plugin = createPwaPlugin(useRegisterSW, PERIOD_SECONDS) as unknown as { setup: () => unknown };
    plugin.setup();
  };

  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllGlobals();
  });

  test("a failed update check is logged rather than left unhandled (vite-pwa/nuxt #182)", async () => {
    expect.hasAssertions();

    const consoleError = vi.spyOn(console, "error").mockImplementation(noop);
    vi.stubGlobal("window", { navigator: { onLine: true } });
    const update = vi.fn<ServiceWorkerRegistration["update"]>(() => Promise.reject(new TypeError("Failed to fetch")));
    registerWorker({ update });
    await vi.advanceTimersByTimeAsync(PERIOD_SECONDS * 1000);
    await waitForSynchronizedFunctions();

    expect(update).toHaveBeenCalledTimes(1);
    expect(consoleError).toHaveBeenCalledTimes(1);
  });

  test("no check is made while offline", async () => {
    expect.hasAssertions();

    vi.stubGlobal("window", { navigator: { onLine: false } });
    const update = vi.fn<ServiceWorkerRegistration["update"]>(() => Promise.resolve({} as ServiceWorkerRegistration));
    registerWorker({ update });
    await vi.advanceTimersByTimeAsync(PERIOD_SECONDS * 1000);

    expect(update).not.toHaveBeenCalled();
  });

  test("no check is made while a new worker installs", async () => {
    expect.hasAssertions();

    vi.stubGlobal("window", { navigator: { onLine: true } });
    const update = vi.fn<ServiceWorkerRegistration["update"]>(() => Promise.resolve({} as ServiceWorkerRegistration));
    registerWorker({ installing: {} as ServiceWorker, update });
    await vi.advanceTimersByTimeAsync(PERIOD_SECONDS * 1000);

    expect(update).not.toHaveBeenCalled();
  });
});
