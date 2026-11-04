// @vitest-environment nuxt
import { Dashboard } from "#shared/models/dashboard/data/Dashboard";
import { VisualType } from "#shared/models/dashboard/data/VisualType";
import ResourceDashboardEditor from "@/components/Resource/Dashboard/Editor.vue";
import { RESOURCE_AUTOSAVE_DEBOUNCE_MS } from "@/services/resource/constants";
import { useDashboardStore } from "@/store/dashboard";
import { useVisualStore } from "@/store/dashboard/visual";
import { waitForSynchronizedFunctions } from "@esposter/shared";
import { mountSuspended } from "@nuxt/test-utils/runtime";
import { afterEach, describe, expect, test, vi } from "vitest";

describe("resourceDashboardEditor", () => {
  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  // The editor's changes are saved on the autosave cadence, so a visual added and left alone is written with no save control
  test("a visual added to the dashboard is autosaved", async () => {
    expect.hasAssertions();

    const dashboardStore = useDashboardStore();
    const { dashboard } = storeToRefs(dashboardStore);
    dashboard.value = new Dashboard();
    // The editor reads its content on mount and writes it through the store's save, so both are stubbed at the store.
    // The save records the visuals the dashboard holds when it runs, since that is what it writes
    const savedVisualTypes: VisualType[][] = [];
    vi.spyOn(dashboardStore, "loadContent").mockResolvedValue(undefined);
    vi.spyOn(dashboardStore, "saveDashboard").mockImplementation(() => {
      savedVisualTypes.push(dashboard.value.visuals.map(({ type }) => type));
      return Promise.resolve(true);
    });
    await mountSuspended(ResourceDashboardEditor);
    vi.useFakeTimers({ now: 0, toFake: ["setTimeout", "clearTimeout"] });
    const visualStore = useVisualStore();
    const { createVisual } = visualStore;
    createVisual(VisualType.Card);
    await nextTick();
    vi.advanceTimersByTime(RESOURCE_AUTOSAVE_DEBOUNCE_MS);
    await waitForSynchronizedFunctions();

    expect(savedVisualTypes).toStrictEqual([[VisualType.Card]]);
  });
});
