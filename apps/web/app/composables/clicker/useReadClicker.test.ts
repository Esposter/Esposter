// @vitest-environment nuxt
import type { VueWrapper } from "@vue/test-utils";

import { BuildingMap } from "#shared/assets/clicker/data/BuildingMap";
import { BuildingId } from "#shared/models/clicker/data/building/BuildingId";
import { Clicker } from "#shared/models/clicker/data/Clicker";
import { useReadClicker } from "@/composables/clicker/useReadClicker";
import { useSession } from "@/services/auth/authClient.test";
import { toClickerSave } from "@/services/clicker/save/toClickerSave";
import { LocalStorageKey } from "@/services/shared/LocalStorageKey";
import { setupMswTrpc } from "@/services/trpc/mswTrpc.test";
import { useClickerStore } from "@/store/clicker";
import { useOfflineProgressStore } from "@/store/clicker/offlineProgress";
import { mountSuspended } from "@nuxt/test-utils/runtime";
import { TRPCError } from "@trpc/server";
import { flushPromises } from "@vue/test-utils";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";

vi.mock(import("@/services/auth/authClient"), () => import("@/services/auth/authClient.test"));

const writeGuestSave = (clicker: Clicker) => {
  localStorage.setItem(LocalStorageKey.ClickerStore, JSON.stringify(toClickerSave(clicker)));
};

describe(useReadClicker, () => {
  const { trpcMsw } = setupMswTrpc();
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

  beforeEach(() => {
    // A guest: the session has settled to no account, so the save is the one in this browser
    useSession.mockImplementation((fetcher?: unknown) =>
      fetcher ? { data: ref<null>(null) } : ref({ data: null, isPending: false }),
    );
  });

  afterEach(() => {
    wrapper?.unmount();
    wrapper = undefined;
    localStorage.clear();
    vi.restoreAllMocks();
    vi.useRealTimers();
  });

  test("hydrates a guest's clicker from the save in this browser", async () => {
    expect.hasAssertions();

    writeGuestSave(new Clicker({ pointCount: 42, updatedAt: new Date() }));
    await mountReadClicker();

    const clickerStore = useClickerStore();

    expect(clickerStore.clicker.pointCount).toBe(42);
  });

  // An absence is paid out as production, and the dialog reports what it was paid. The clock is pinned to the hour
  // The save was stamped at the epoch, so the absence is exactly that hour: one cursor's tenth of a point a second, at the offline rate
  test("awards the production an absence earned while the page was closed", async () => {
    expect.hasAssertions();

    vi.useFakeTimers({ now: Temporal.Instant.fromEpochMilliseconds(0).add({ hours: 1 }), toFake: ["Date"] });
    writeGuestSave(
      new Clicker({
        boughtBuildings: [{ ...BuildingMap[BuildingId.Cursor], amount: 1, id: BuildingId.Cursor, producedValue: 0 }],
        updatedAt: new Date(0),
      }),
    );
    await mountReadClicker();
    const offlineProgressStore = useOfflineProgressStore();
    const { awardedPoints } = storeToRefs(offlineProgressStore);
    const clickerStore = useClickerStore();

    expect(awardedPoints.value).toBe(180);
    expect(clickerStore.clicker.pointCount).toBe(awardedPoints.value);
  });

  // A signed-in player's save is the server's copy, so when its read fails the page does not open over a new game, and
  // A change made in its place is not saved over the copy the read could not reach
  test("does not save a change made after the read of the server's save fails", async () => {
    expect.hasAssertions();

    const userId = crypto.randomUUID();
    useSession.mockImplementation((fetcher?: unknown) =>
      fetcher ? { data: ref({ user: { id: userId } }) } : ref({ data: { user: { id: userId } }, isPending: false }),
    );
    let isSaved = false;
    trpcMsw.clicker.readClicker.query(() => {
      throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "The saved game could not be read" });
    });
    trpcMsw.clicker.saveClicker.mutation(() => {
      isSaved = true;
      return { etag: "etag" };
    });
    await expect(mountReadClicker()).rejects.toThrowErrorMatchingInlineSnapshot(
      `[TRPCClientError: The saved game could not be read]`,
    );

    const clickerStore = useClickerStore();
    const { clicker } = storeToRefs(clickerStore);
    clicker.value.boughtBuildings.push({
      ...BuildingMap[BuildingId.Cursor],
      amount: 1,
      id: BuildingId.Cursor,
      producedValue: 0,
    });
    await flushPromises();

    expect(isSaved).toBe(false);
  });

  // A guest's save lives only in this browser, so one that cannot be read is reported and replaced by a new game, so the
  // Page still opens
  test("starts a new clicker when the save in this browser cannot be read", async () => {
    expect.hasAssertions();

    vi.spyOn(console, "error").mockImplementation(() => {});
    localStorage.setItem(LocalStorageKey.ClickerStore, "{not json");
    await mountReadClicker();

    const clickerStore = useClickerStore();

    expect(clickerStore.clicker.pointCount).toBe(0);
  });
});
