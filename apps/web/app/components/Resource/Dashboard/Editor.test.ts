// @vitest-environment nuxt
import type { VueWrapper } from "@vue/test-utils";

import { Dashboard } from "#shared/models/dashboard/data/Dashboard";
import { Visual } from "#shared/models/dashboard/data/Visual";
import { VisualType } from "#shared/models/dashboard/data/VisualType";
import { createResourceListItem } from "#shared/services/resource/list/createResourceListItem.test";
import DashboardEditorGroupForm from "@/components/Dashboard/Editor/GroupForm.vue";
import DashboardEditorPalette from "@/components/Dashboard/Editor/Palette.vue";
import DashboardEditorSettings from "@/components/Dashboard/Editor/Settings.vue";
import DashboardEditorVisualForm from "@/components/Dashboard/Editor/VisualForm.vue";
import DashboardVisualPreviewContainer from "@/components/Dashboard/Visual/Preview/Container.vue";
import EditorShell from "@/components/Editor/Shell.vue";
import ResourceDashboardEditor from "@/components/Resource/Dashboard/Editor.vue";
import UiRadioGroup from "@/components/Ui/RadioGroup.vue";
import UiTextField from "@/components/Ui/TextField.vue";
import { DashboardEditorRegion } from "@/models/dashboard/DashboardEditorRegion";
import { DashboardSelectionKind } from "@/models/dashboard/DashboardSelectionKind";
import { DashboardEditorRegistry } from "@/services/dashboard/editor/DashboardEditorRegistry";
import { DashboardLayout } from "@/services/dashboard/editor/DashboardLayout";
import { stubGridWidth } from "@/services/dashboard/grid/stubGridWidth.test";
import { RESOURCE_AUTOSAVE_DEBOUNCE_MS } from "@/services/resource/constants";
import { stubApexChartEngine } from "@/services/styled/stubApexChartEngine.test";
import { setupMswTrpc } from "@/services/trpc/mswTrpc.test";
import { useDashboardStore } from "@/store/dashboard";
import { useVisualStore } from "@/store/dashboard/visual";
import { useResourceStore } from "@/store/resource";
import { ResourceType } from "@esposter/db-schema";
import { takeOne, waitForSynchronizedFunctions } from "@esposter/shared";
import { mountSuspended } from "@nuxt/test-utils/runtime";
import { flushPromises } from "@vue/test-utils";
import { afterEach, assert, beforeAll, beforeEach, describe, expect, test, vi } from "vitest";
import { checkLayout } from "vue-editor-layout-headless";

// The window's size class decides whether the palette and the inspector are docked beside the grid or sheets over it,
// So a test says how wide the window is before the editor mounts. A window is expanded unless a test says otherwise
const display = vi.hoisted(() => ({ isCompact: false, isMobile: false }));
vi.mock(import("@/composables/ui/useUiDisplay"), async (importOriginal) => {
  const actual = await importOriginal();

  return {
    ...actual,
    useUiDisplay: () => ({
      ...actual.useUiDisplay(),
      isMobile: shallowRef(display.isMobile),
      xs: shallowRef(display.isCompact),
    }),
  };
});

// A press on a visual's tile, which the tile's container takes as a click: the press selects the visual it draws
const pressVisual = async (wrapper: VueWrapper, visualId: Visual["id"]) => {
  const preview = wrapper
    .findAllComponents(DashboardVisualPreviewContainer)
    .find((container) => container.props("visual").id === visualId);
  assert(preview);
  await preview.trigger("mousedown");
  await preview.trigger("click");
  await flushPromises();
};

describe("resourceDashboardEditor", () => {
  const { trpcMsw } = setupMswTrpc();
  const resourceId = crypto.randomUUID();
  // The editor's grid is twelve columns across this width, the same as the grid's own suite
  const gridWidth = 970;
  const createResource = (contentVersion = 0) =>
    createResourceListItem({ contentVersion, id: resourceId, type: ResourceType.Dashboard });

  // Stubbed once for the file: an `unstubAllGlobals` after each test would also unstub the fetch `setupMswTrpc` stubs
  beforeAll(() => {
    stubGridWidth(gridWidth);
  });
  beforeEach(() => {
    stubApexChartEngine();
    display.isCompact = false;
    display.isMobile = false;
    localStorage.clear();
    Object.assign(useRouter().currentRoute.value.params, { id: resourceId });
    trpcMsw.resource.readResource.query(() => ({ ...createResource(), publication: null }));
    trpcMsw.dashboard.readResourcePublication.query(() => undefined);
    trpcMsw.dashboard.saveResourceContent.mutation(() => createResource(1));
  });
  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  // The editor mounts over the content its page has read, as the page reads the row before any blade mounts
  const mountEditor = async (visuals: Visual[]) => {
    trpcMsw.dashboard.readResourceContent.query(() => new Dashboard({ visuals }));
    const resourceStore = useResourceStore();
    const { readResource } = resourceStore;
    await readResource();
    const wrapper = await mountSuspended(ResourceDashboardEditor);
    await flushPromises();
    return wrapper;
  };

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
    // oxlint-disable-next-line testing/no-faked-set-timeout -- the autosave debounce is counted by the clock; the afterEach above restores the real timers before the harness waits a turn on setTimeout
    vi.useFakeTimers({ now: 0, toFake: ["setTimeout", "clearTimeout"] });
    const visualStore = useVisualStore();
    const { createVisual } = visualStore;
    createVisual(VisualType.Card);
    await nextTick();
    vi.advanceTimersByTime(RESOURCE_AUTOSAVE_DEBOUNCE_MS);
    await waitForSynchronizedFunctions();

    expect(savedVisualTypes).toStrictEqual([[VisualType.Card]]);
  });

  // The inspector takes the selected visual's form, and the grid stays drawn beside it so the change is seen on the canvas
  test("selecting a visual shows its edit form in the inspector", async () => {
    expect.hasAssertions();

    const barVisual = new Visual({ type: VisualType.Bar });
    const wrapper = await mountEditor([barVisual]);
    await pressVisual(wrapper, barVisual.id);

    expect({
      form: wrapper.findComponent(DashboardEditorVisualForm).exists(),
      grid: wrapper.find(".dashboard-grid").exists(),
      settings: wrapper.findComponent(DashboardEditorSettings).exists(),
    }).toStrictEqual({ form: true, grid: true, settings: false });
  });

  // The form's change is written onto the visual while the canvas is in view, so the tile it draws redraws as the type changes
  test("a form change redraws the visual", async () => {
    expect.hasAssertions();

    const barVisual = new Visual({ type: VisualType.Bar });
    const wrapper = await mountEditor([barVisual]);
    await pressVisual(wrapper, barVisual.id);
    const typeSelect = wrapper
      .findAllComponents({ name: "UiSelect" })
      .find((select) => select.props("label") === "Visual type");
    assert(typeSelect);
    typeSelect.vm.$emit("update:modelValue", VisualType.Line);
    await flushPromises();
    const visualStore = useVisualStore();
    const { visuals } = storeToRefs(visualStore);

    expect(takeOne(visuals.value).type).toBe(VisualType.Line);
  });

  // A group has no chart to edit, so its inspector entry is its title alone
  test("a group selected shows its title", async () => {
    expect.hasAssertions();

    const groupVisual = new Visual({ type: VisualType.Group, visuals: [] });
    const wrapper = await mountEditor([groupVisual]);
    await pressVisual(wrapper, groupVisual.id);
    const groupForm = wrapper.findComponent(DashboardEditorGroupForm);

    expect({ form: groupForm.exists(), label: groupForm.findComponent(UiTextField).props("label") }).toStrictEqual({
      form: true,
      label: "Title",
    });
  });

  // With nothing selected the inspector shows how visuals pack and what a drop does, which the bar's popover held
  test("nothing selected shows the dashboard's layout settings", async () => {
    expect.hasAssertions();

    const wrapper = await mountEditor([new Visual({ type: VisualType.Bar })]);

    expect({
      labels: wrapper.findAllComponents(UiRadioGroup).map((group) => group.props("label")),
      settings: wrapper.findComponent(DashboardEditorSettings).exists(),
    }).toStrictEqual({ labels: ["Packing", "Overlaps"], settings: true });
  });

  // A compact window draws the palette as a sheet that stays shut until the reader opens it. The shell's button for it is
  // Not yet drawn, so the test opens the region through the shell's own function, the one the button will call
  test("the palette is a region the reader opens", async () => {
    expect.hasAssertions();

    display.isCompact = true;
    display.isMobile = true;
    const wrapper = await mountEditor([new Visual({ type: VisualType.Bar })]);
    wrapper.findComponent(EditorShell).vm.toggleRegion(DashboardEditorRegion.Visuals);
    await flushPromises();
    const palette = wrapper.findComponent(DashboardEditorPalette);
    assert(palette.element instanceof HTMLElement);

    expect(palette.element.closest("dialog")?.open).toBe(true);
  });

  test("the dashboard's layout passes the layout check", () => {
    expect.hasAssertions();

    const selectionKinds = ["", DashboardSelectionKind.Group, DashboardSelectionKind.Visual];

    expect(checkLayout(DashboardLayout, selectionKinds, Object.keys(DashboardEditorRegistry))).toStrictEqual([]);
  });
});
