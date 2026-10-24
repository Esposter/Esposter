// @vitest-environment nuxt
import type { VueWrapper } from "@vue/test-utils";

import { BuildingMap } from "#shared/assets/clicker/data/BuildingMap";
import { BuildingId } from "#shared/models/clicker/data/building/BuildingId";
import { Clicker } from "#shared/models/clicker/data/Clicker";
import { useReadClicker } from "@/composables/clicker/useReadClicker";
import { useSession } from "@/services/auth/authClient.test";
import { toClickerSave } from "@/services/clicker/save/toClickerSave";
import { LocalStorageKey } from "@/services/shared/LocalStorageKey";
import { useClickerStore } from "@/store/clicker";
import { useOfflineProgressStore } from "@/store/clicker/offlineProgress";
import { mountSuspended } from "@nuxt/test-utils/runtime";
import { flushPromises } from "@vue/test-utils";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";

vi.mock(import("@/services/auth/authClient"), () => import("@/services/auth/authClient.test"));

describe(useReadClicker, () => {
  const hourMs = 60 * 60 * 1000;
  let wrapper: undefined | VueWrapper;
  const mountReadClicker = async () => {
    wrapper = await mountSuspended(
      defineComponent({
        async setup() {
          await useReadClicker();
          return () => h("div");
        },
      }),
    );
    await flushPromises();
  };
  const writeGuestSave = (clicker: Clicker) => {
    localStorage.setItem(LocalStorageKey.ClickerStore, JSON.stringify(toClickerSave(clicker)));
  };

  beforeEach(() => {
    // A guest: the session has settled to no account, so the save is the one in this browser
    useSession.mockImplementation((fetcher?: unknown) =>
      fetcher ? { data: ref(null) } : ref({ data: null, isPending: false }),
    );
  });

  afterEach(() => {
    wrapper?.unmount();
    wrapper = undefined;
    localStorage.clear();
    vi.restoreAllMocks();
  });

  test("hydrates a guest's clicker from the save in this browser", async () => {
    expect.hasAssertions();

    writeGuestSave(new Clicker({ pointCount: 42, updatedAt: new Date() }));
    await mountReadClicker();

    expect(useClickerStore().clicker.pointCount).toBe(42);
  });

  // An absence is paid out as production, and the dialog reports what it was paid
  test("awards the production an absence earned while the page was closed", async () => {
    expect.hasAssertions();

    writeGuestSave(
      new Clicker({
        boughtBuildings: [{ ...BuildingMap[BuildingId.Cursor], amount: 1, id: BuildingId.Cursor, producedValue: 0 }],
        updatedAt: new Date(Date.now() - hourMs),
      }),
    );
    await mountReadClicker();
    const { awardedPoints } = storeToRefs(useOfflineProgressStore());

    expect(awardedPoints.value).toBeGreaterThan(0);
    expect(useClickerStore().clicker.pointCount).toBe(awardedPoints.value);
  });

  // A save that cannot be read is reported and replaced by a new game, so the page still opens
  test("starts a new clicker when the save in this browser cannot be read", async () => {
    expect.hasAssertions();

    vi.spyOn(console, "error").mockImplementation(() => {});
    localStorage.setItem(LocalStorageKey.ClickerStore, "{not json");
    await mountReadClicker();

    expect(useClickerStore().clicker.pointCount).toBe(0);
  });
});
