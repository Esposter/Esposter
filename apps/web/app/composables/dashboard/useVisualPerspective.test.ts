// @vitest-environment happy-dom
import "apexcharts/features/perspectives";
import ApexCharts from "apexcharts";
import { describe, expect, test } from "vitest";

// The composable reads `chart.perspectives` off the instance, and the instance only has it once the feature module is
// Registered. This one reference registers it, the feature the chart component also loads for the dashboard's options:
// Drop it and `perspectives` is undefined, so the round trip throws, and this test fails
describe(useVisualPerspective, () => {
  test("encodes a captured view and decodes it back to the same view", () => {
    expect.hasAssertions();

    const chart = new ApexCharts(document.createElement("div"), {});
    const captured = chart.perspectives.capture();

    expect(chart.perspectives.decode(chart.perspectives.encode(captured))).toStrictEqual(captured);
  });
});
