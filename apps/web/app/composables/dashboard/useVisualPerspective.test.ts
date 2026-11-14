// @vitest-environment nuxt
import "apexcharts/features/perspectives";
import ApexCharts from "apexcharts";
import { describe, expect, test } from "vitest";

// The composable reads `chart.perspectives` off the instance, and the instance only has it once the feature module is
// Registered. This one reference registers it, the feature the chart component also loads for the dashboard's options:
// Drop it and the option is absent, every capture returns nothing, and this test fails
describe(useVisualPerspective, () => {
  test("gives the chart instance the perspectives it captures and applies view state with", () => {
    expect.hasAssertions();

    const chart = new ApexCharts(document.createElement("div"), {});

    expect(chart.perspectives.apply).toBeTypeOf("function");
    expect(chart.perspectives.capture).toBeTypeOf("function");
    expect(chart.perspectives.encode).toBeTypeOf("function");
  });
});
