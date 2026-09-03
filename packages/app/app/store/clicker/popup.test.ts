// @vitest-environment nuxt
import { usePopupStore } from "@/store/clicker/popup";
import { createPinia, setActivePinia } from "pinia";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";

// The store chain reaches the clicker store's theme colours, and Vuetify's `useTheme` throws outside a
// Component's setup — nothing a popup's lifetime depends on, so the colours are stubbed rather than mounted
vi.mock(import("@/store/colors"), () => ({
  useColorsStore: () =>
    ({ error: "", info: "", primary: "" }) as unknown as ReturnType<typeof import("@/store/colors").useColorsStore>,
}));

describe(usePopupStore, () => {
  // The store schedules the removal with the same duration the popup animates for, so anything past it is
  // Long enough for the timer to have fired
  const POPUP_DURATION_MS = Temporal.Duration.from({ seconds: 10 }).total("milliseconds");
  const event = new MouseEvent("click");

  beforeEach(() => {
    vi.useFakeTimers();
    setActivePinia(createPinia());
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  // The popup fades out on its own animation, so nothing on screen says whether the entry behind it was ever
  // Removed — a removal that misses its own popup grows the array for the whole session with nothing visible
  test("removes a popup once its animation has run", () => {
    expect.hasAssertions();

    const popupStore = usePopupStore();
    const { popups } = storeToRefs(popupStore);
    const { createPopup } = popupStore;
    createPopup(event);

    expect(popups.value).toHaveLength(1);

    vi.advanceTimersByTime(POPUP_DURATION_MS);

    expect(popups.value).toStrictEqual([]);
  });
});
