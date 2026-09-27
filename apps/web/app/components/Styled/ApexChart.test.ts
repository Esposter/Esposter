// @vitest-environment nuxt
import StyledApexChart from "@/components/Styled/ApexChart.vue";
import { mountSuspended } from "@nuxt/test-utils/runtime";
import { assert, describe, expect, test } from "vitest";
import VueApexCharts from "vue3-apexcharts";

describe("styledApexChart", () => {
  // ApexCharts writes a legend entry with innerHTML, and a single-series chart's entries are data a survey respondent
  // Wrote, so a caller's own legend formatter runs but must not be able to hand the entry raw text
  test("escapes a legend entry after the caller's formatter", async () => {
    expect.hasAssertions();

    const component = await mountSuspended(StyledApexChart, {
      props: { options: { legend: { formatter: (legendName: string) => `${legendName}%` } }, series: [], type: "pie" },
      shallow: true,
    });
    const formatter = component.findComponent(VueApexCharts).props("options")?.legend?.formatter;
    assert.exists(formatter);

    expect(formatter("<b>", { seriesIndex: 0, w: { config: {}, globals: {} } })).toBe("&lt;b&gt;%");
  });
});
