import ApexCharts from "apexcharts";
import { describe, vi } from "vitest";

// The engine resolves a render or an update to the chart it ran on
export const resolveToChart = function (this: ApexCharts) {
  return Promise.resolve(this);
};

// The engine measures its SVG as it draws, which a DOM without layout cannot do, and it rejects a draw that is still
// Pending when its chart is torn down. A test that mounts a chart only needs the component's own building, updating and
// Tearing down, so the engine's drawing is stubbed. It returns the spies, for a test that asserts on them
export const stubApexChartEngine = () => ({
  destroy: vi.spyOn(ApexCharts.prototype, "destroy").mockReturnValue(),
  render: vi.spyOn(ApexCharts.prototype, "render").mockImplementation(resolveToChart),
  updateOptions: vi.spyOn(ApexCharts.prototype, "updateOptions").mockImplementation(resolveToChart),
});

describe.todo("stubApexChartEngine");
