import { getStyledApexOptions } from "@/services/styled/getStyledApexOptions";
import { assert, describe, expect, test } from "vitest";

describe(getStyledApexOptions, () => {
  // ApexCharts writes a legend entry with innerHTML, and a single-series chart's entries are data a survey respondent
  // Wrote, so a caller's own legend formatter runs but must not be able to hand the entry raw text
  test("escapes a legend entry after the caller's formatter", () => {
    expect.hasAssertions();

    const { legend } = getStyledApexOptions({
      isDark: false,
      options: { legend: { formatter: (legendName: string) => `${legendName}%` } },
      series: [],
      type: "pie",
    });
    const formatter = legend?.formatter;
    assert.exists(formatter);

    expect(formatter("<b>", { seriesIndex: 0, w: { config: {}, globals: {} } })).toBe("&lt;b&gt;%");
  });

  test("#32 keeps the chart height the options name", () => {
    expect.hasAssertions();

    const height = 1;
    const { chart } = getStyledApexOptions({ isDark: false, options: { chart: { height } }, series: [] });

    expect(chart?.height).toBe(height);
  });

  test("sets the series over the options rather than merging the two", () => {
    expect.hasAssertions();

    const { series } = getStyledApexOptions({ isDark: false, options: { series: [1] }, series: [2] });

    expect(series).toStrictEqual([2]);
  });
});
