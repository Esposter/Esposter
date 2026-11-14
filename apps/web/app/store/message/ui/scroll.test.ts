// @vitest-environment nuxt
import type { Router } from "vue-router";

import { useDataStore } from "@/store/message/data";
import { useScrollStore } from "@/store/message/ui/scroll";
import { RoutePath } from "@esposter/shared";
import { mockNuxtImport } from "@nuxt/test-utils/runtime";
import { v7 } from "uuid";
import { afterEach, beforeAll, beforeEach, describe, expect, test, vi } from "vitest";

const { navigateToMock } = vi.hoisted(() => ({ navigateToMock: vi.fn<typeof navigateTo>() }));

mockNuxtImport("navigateTo", () => navigateToMock);

describe(useScrollStore, () => {
  const roomId = v7();
  const messageId = v7();
  const secondMessageId = v7();
  const highlightMs = Temporal.Duration.from({ seconds: 2 }).total("milliseconds");
  let router: Router;

  beforeAll(() => {
    router = useRouter();
  });

  beforeEach(() => {
    vi.useFakeTimers();
    Object.assign(router.currentRoute.value.params, { id: roomId, messageId: "" });
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  test("setActiveMessageId clears activeMessageId after highlight delay", () => {
    expect.hasAssertions();

    const scrollStore = useScrollStore();
    const { setActiveMessageId } = scrollStore;
    const { activeMessageId } = storeToRefs(scrollStore);
    setActiveMessageId(messageId);

    expect(activeMessageId.value).toBe(messageId);

    vi.advanceTimersByTime(highlightMs - 1);

    expect(activeMessageId.value).toBe(messageId);

    vi.advanceTimersByTime(1);

    expect(activeMessageId.value).toBe("");
  });

  test("setActiveMessageId restarts the clear timer", () => {
    expect.hasAssertions();

    const scrollStore = useScrollStore();
    const { setActiveMessageId } = scrollStore;
    const { activeMessageId } = storeToRefs(scrollStore);
    setActiveMessageId(messageId);
    vi.advanceTimersByTime(highlightMs - 1);
    setActiveMessageId(secondMessageId);
    vi.advanceTimersByTime(1);

    expect(activeMessageId.value).toBe(secondMessageId);

    vi.advanceTimersByTime(highlightMs - 1);

    expect(activeMessageId.value).toBe("");
  });

  // The newer messages a permalink window leaves unloaded are above everything the list holds, so no scroll
  // Reaches them — the window itself has to be re-read from the newest page
  test("jumpToPresent re-reads the newest page when the loaded window is not the live tail", async () => {
    expect.hasAssertions();

    const dataStore = useDataStore();
    dataStore.getHasMoreNewerRef(roomId).value = true;
    Object.assign(router.currentRoute.value.params, { messageId });
    const scrollStore = useScrollStore();
    const { jumpToPresent } = scrollStore;
    await jumpToPresent();

    expect(navigateToMock).toHaveBeenCalledExactlyOnceWith(RoutePath.Messages(roomId));
  });

  // A reader who paged forward to the present still has the permalink route in the address bar, and re-reading
  // The room over a window that already holds the newest message throws away everything they scrolled through
  test("jumpToPresent scrolls rather than re-reads when the loaded window is the live tail", async () => {
    expect.hasAssertions();

    Object.assign(router.currentRoute.value.params, { messageId });
    const scrollStore = useScrollStore();
    const { jumpToPresent } = scrollStore;
    await jumpToPresent();

    expect(navigateToMock).not.toHaveBeenCalled();
  });
});
