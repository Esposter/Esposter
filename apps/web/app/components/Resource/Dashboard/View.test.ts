// @vitest-environment nuxt
import { Dashboard } from "#shared/models/dashboard/data/Dashboard";
import { Visual } from "#shared/models/dashboard/data/Visual";
import { VisualType } from "#shared/models/dashboard/data/VisualType";
import DashboardVisualPreviewActionsMenu from "@/components/Dashboard/Visual/Preview/ActionsMenu.vue";
import EditorShell from "@/components/Editor/Shell.vue";
import ResourceDashboardView from "@/components/Resource/Dashboard/View.vue";
import { stubGridWidth } from "@/services/dashboard/grid/stubGridWidth.test";
import { setupMswTrpc } from "@/services/trpc/mswTrpc.test";
import { mountSuspended } from "@nuxt/test-utils/runtime";
import { flushPromises } from "@vue/test-utils";
import { assert, beforeAll, describe, expect, test } from "vitest";
import { CompactType } from "vue-grid-layout-headless";

describe("resourceDashboardView", () => {
  const { trpcMsw } = setupMswTrpc();
  const id = crypto.randomUUID();
  const name = "a";
  // A desktop-width page takes the six columns of its breakpoint, which leaves room for a visual to pack sideways
  const gridWidth = 970;
  const mockPublishedDashboard = (content: Dashboard) => {
    trpcMsw.dashboard.readPublishedResourceContent.query(() => ({ content, name }));
  };

  // Stubbed once for the file: an `unstubAllGlobals` after each test would also unstub the fetch `setupMswTrpc` stubs
  beforeAll(() => {
    stubGridWidth(gridWidth);
  });

  // The page draws its visuals with the packing it was saved with, so a visual the owner packed sideways moves left
  test("the published dashboard packs by the saved choice", async () => {
    expect.hasAssertions();

    mockPublishedDashboard(
      new Dashboard({
        compactType: CompactType.Horizontal,
        visuals: [new Visual({ h: 2, type: VisualType.Card, w: 2, x: 4, y: 0 })],
      }),
    );
    const component = await mountSuspended(ResourceDashboardView, { props: { id } });
    await flushPromises();
    const tile = component.get(".dashboard-grid-tile");
    assert(tile.element instanceof HTMLElement);

    expect(tile.element.style.left).toBe("10px");
  });

  // A viewer reads the visuals and exports the page, and no control to edit the dashboard is drawn
  test("viewing a published dashboard", async () => {
    expect.hasAssertions();

    mockPublishedDashboard(new Dashboard({ visuals: [new Visual({ h: 2, type: VisualType.Card, w: 2, x: 0, y: 0 })] }));
    const component = await mountSuspended(ResourceDashboardView, { props: { id } });
    await flushPromises();

    expect({
      exportPng: component.findAll("button").some((button) => button.text() === "Export PNG"),
      menu: component.findComponent(DashboardVisualPreviewActionsMenu).exists(),
      tiles: component.findAll(".dashboard-grid-tile").length,
    }).toStrictEqual({ exportPng: true, menu: false, tiles: 1 });
  });

  // The editor's bar, palette and inspector are drawn by the editor's shell alone, so a viewer gets none of them
  test("the published page draws no editor regions", async () => {
    expect.hasAssertions();

    mockPublishedDashboard(new Dashboard({ visuals: [new Visual({ h: 2, type: VisualType.Card, w: 2, x: 0, y: 0 })] }));
    const component = await mountSuspended(ResourceDashboardView, { props: { id } });
    await flushPromises();
    const buttonTexts = new Set(component.findAll("button").map((button) => button.text()));

    expect({
      addVisual: buttonTexts.has("Add visual"),
      editorShell: component.findComponent(EditorShell).exists(),
      layout: buttonTexts.has("Layout"),
    }).toStrictEqual({ addVisual: false, editorShell: false, layout: false });
  });
});
