// @vitest-environment nuxt
import ApexCharts from "apexcharts";
import { describe, expect, test } from "vitest";

// The composable reads `chart.perspectives` off the instance, and the instance only has it once the feature module is
// Registered. The feature is imported by the composable itself, so this one reference loads that import: drop it and
// The option is absent, every capture returns nothing, and no test fails anywhere else
describe(useVisualPerspective, () => {
  test("gives the chart instance the perspectives it captures and applies view state with", () => {
    expect.hasAssertions();

    const chart = new ApexCharts(document.createElement("div"), {});

    expect(chart.perspectives.apply).toBeTypeOf("function");
    expect(chart.perspectives.capture).toBeTypeOf("function");
    expect(chart.perspectives.encode).toBeTypeOf("function");
  });
});
