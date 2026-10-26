// @vitest-environment nuxt
import { MimeType } from "#shared/models/file/MimeType";
import { FlowchartExportFormat } from "@/models/resource/FlowchartExportFormat";
import { captureFlowchart } from "@/services/capture/captureFlowchart";
import { exportDashboardPng } from "@/services/dashboard/export/exportDashboardPng";
import { useAlertStore } from "@/store/alert";
import { downloadFile, InvalidOperationError, Operation } from "@esposter/shared";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";

vi.mock(import("@esposter/shared"), async (importOriginal) => ({
  ...(await importOriginal()),
  downloadFile: vi.fn<typeof downloadFile>(),
}));

// The real capture runs in the test where the SVG is checked, and the PNG tests take its answer from a resolved once-value
vi.mock(import("@/services/capture/captureFlowchart"), async (importOriginal) => {
  const { captureFlowchart: captureOriginal } = await importOriginal();
  return { captureFlowchart: vi.fn<typeof captureOriginal>(captureOriginal) };
});

describe(exportDashboardPng, () => {
  const dashboardName = "Quarterly sales";
  const tileTitles = ["Revenue", "Orders"];

  // The capture reads the grid the dashboard draws, so a test lays out one with a tile per title
  const appendGrid = () => {
    const grid = document.createElement("div");
    grid.className = "dashboard-grid";
    for (const title of tileTitles) {
      const tile = document.createElement("div");
      tile.textContent = title;
      grid.append(tile);
    }
    vi.spyOn(grid, "getBoundingClientRect").mockReturnValue(new DOMRect(0, 0, 640, 480));
    document.body.append(grid);
    return grid;
  };

  beforeEach(() => {
    // A browser always has a font loader, and the test environment does not, so one that is ready at once stands in
    Object.defineProperty(document, "fonts", { configurable: true, value: { ready: Promise.resolve() } });
  });
  afterEach(() => {
    vi.restoreAllMocks();
    Reflect.deleteProperty(document, "fonts");
    document.querySelector(".dashboard-grid")?.remove();
  });

  test("a grid with two tiles is captured as one image carrying both titles", async () => {
    expect.hasAssertions();

    const grid = appendGrid();
    const svg = await captureFlowchart(grid, FlowchartExportFormat.Svg);
    const svgText = await svg.text();

    for (const title of tileTitles) expect(svgText).toContain(title);
  });

  test("the dashboard's page downloads as a PNG named after the dashboard", async () => {
    expect.hasAssertions();

    const grid = appendGrid();
    const png = new Blob([], { type: MimeType.Png });
    vi.mocked(captureFlowchart).mockResolvedValueOnce(png);

    await exportDashboardPng(dashboardName);

    expect(captureFlowchart).toHaveBeenCalledExactlyOnceWith(grid, FlowchartExportFormat.Png);
    expect(downloadFile).toHaveBeenCalledExactlyOnceWith(`${dashboardName}.png`, png, MimeType.Png);
  });

  test("a page that cannot be captured alerts and downloads nothing", async () => {
    expect.hasAssertions();

    appendGrid();
    vi.mocked(captureFlowchart).mockRejectedValueOnce(
      new InvalidOperationError(Operation.Read, "captureFlowchart", "Canvas has no size"),
    );

    await exportDashboardPng(dashboardName);

    expect(downloadFile).not.toHaveBeenCalled();
    const alertStore = useAlertStore();

    expect(alertStore.alerts.map(({ text, type }) => ({ text, type }))).toStrictEqual([
      { text: "Couldn't export this dashboard", type: "error" },
    ]);
  });
});
