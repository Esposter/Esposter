// @vitest-environment nuxt
import type { Router } from "vue-router";

import { dayjs } from "#shared/services/dayjs";
import { useDataStore } from "@/store/message/data";
import { useScrollStore } from "@/store/message/ui/scroll";
import { RoutePath } from "@esposter/shared";
import { mockNuxtImport } from "@nuxt/test-utils/runtime";
import { createPinia, setActivePinia } from "pinia";
import { afterEach, beforeAll, beforeEach, describe, expect, test, vi } from "vitest";

const { navigateToMock } = vi.hoisted(() => ({ navigateToMock: vi.fn<typeof navigateTo>() }));

mockNuxtImport("navigateTo", () => navigateToMock);

describe(useScrollStore, () => {
  const roomId = crypto.randomUUID();
  const rowKey = crypto.randomUUID();
  const secondRowKey = crypto.randomUUID();
  const highlightMs = dayjs.duration(2, "seconds").asMilliseconds();
  let router: Router;

  beforeAll(() => {
    router = useRouter();
  });

  beforeEach(() => {
    vi.useFakeTimers();
    setActivePinia(createPinia());
    router.currentRoute.value.params.id = roomId;
    delete router.currentRoute.value.params.rowKey;
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.resetAllMocks();
  });

  test("setActiveRowKey clears activeRowKey after highlight delay", () => {
    expect.hasAssertions();

    const scrollStore = useScrollStore();
    const { setActiveRowKey } = scrollStore;
    const { activeRowKey } = storeToRefs(scrollStore);
    setActiveRowKey(rowKey);

    expect(activeRowKey.value).toBe(rowKey);

    vi.advanceTimersByTime(highlightMs - 1);

    expect(activeRowKey.value).toBe(rowKey);

    vi.advanceTimersByTime(1);

    expect(activeRowKey.value).toBe("");
  });

  test("setActiveRowKey restarts the clear timer", () => {
    expect.hasAssertions();

    const scrollStore = useScrollStore();
    const { setActiveRowKey } = scrollStore;
    const { activeRowKey } = storeToRefs(scrollStore);
    setActiveRowKey(rowKey);
    vi.advanceTimersByTime(highlightMs - 1);
    setActiveRowKey(secondRowKey);
    vi.advanceTimersByTime(1);

    expect(activeRowKey.value).toBe(secondRowKey);

    vi.advanceTimersByTime(highlightMs - 1);

    expect(activeRowKey.value).toBe("");
  });

  // The newer messages a permalink window leaves unloaded are above everything the list holds, so no scroll
  // Reaches them — the window itself has to be re-read from the newest page
  test("jumpToPresent re-reads the newest page when the loaded window is not the live tail", async () => {
    expect.hasAssertions();

    const dataStore = useDataStore();
    dataStore.getHasMoreNewerRef(roomId).value = true;
    router.currentRoute.value.params.rowKey = rowKey;
    const { jumpToPresent } = useScrollStore();
    await jumpToPresent();

    expect(navigateToMock).toHaveBeenCalledExactlyOnceWith(RoutePath.Messages(roomId));
  });

  // A reader who paged forward to the present still has the permalink route in the address bar, and re-reading
  // The room over a window that already holds the newest message throws away everything they scrolled through
  test("jumpToPresent scrolls rather than re-reads when the loaded window is the live tail", async () => {
    expect.hasAssertions();

    router.currentRoute.value.params.rowKey = rowKey;
    const { jumpToPresent } = useScrollStore();
    await jumpToPresent();

    expect(navigateToMock).not.toHaveBeenCalled();
  });
});
