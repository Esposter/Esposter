// @vitest-environment nuxt
import "@/components/Styled/ApexChart.client.vue";
import ApexCharts from "apexcharts";
import { describe, expect, test } from "vitest";

// The composable reads `chart.perspectives` off the instance, and the instance only has it once the feature module is
// Registered. The chart component registers it, the one place a chart draws, so this one reference loads that component:
// Drop the registration there and the option is absent, every capture returns nothing, and this test fails
describe(useVisualPerspective, () => {
  test("gives the chart instance the perspectives it captures and applies view state with", () => {
    expect.hasAssertions();

    const chart = new ApexCharts(document.createElement("div"), {});

    expect(chart.perspectives.apply).toBeTypeOf("function");
    expect(chart.perspectives.capture).toBeTypeOf("function");
    expect(chart.perspectives.encode).toBeTypeOf("function");
  });
});
