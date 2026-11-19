import { getStyledApexOptions } from "#src/services/styled/getStyledApexOptions";
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

  // ApexCharts writes a tooltip's title with innerHTML, and a line's x value is its category's index: the title is the
  // Category's name, looked up by the index, which Apex writes raw because it differs from the index it formatted
  test("escapes a tooltip title the chart looked up by index", () => {
    expect.hasAssertions();

    const { tooltip } = getStyledApexOptions({ isDark: false, options: {}, series: [] });
    const formatter = tooltip?.x?.formatter;
    assert.exists(formatter);

    expect(formatter(0, { w: { formatters: { xLabelFormatter: () => "<b>" } } } as never)).toBe("&lt;b&gt;");
  });

  test("escapes a tooltip title after the caller's formatter", () => {
    expect.hasAssertions();

    const { tooltip } = getStyledApexOptions({
      isDark: false,
      options: { tooltip: { x: { formatter: (value: number | string) => `${value}%` } } },
      series: [],
    });
    const formatter = tooltip?.x?.formatter;
    assert.exists(formatter);

    expect(formatter("<b>")).toBe("&lt;b&gt;%");
  });

  test("escapes a series name's row title", () => {
    expect.hasAssertions();

    const { tooltip } = getStyledApexOptions({ isDark: false, options: {}, series: [] });
    const y = tooltip?.y;
    assert(y !== undefined && !Array.isArray(y));
    const formatter = y.title?.formatter;
    assert.exists(formatter);

    expect(formatter("<b>")).toBe("&lt;b&gt;: ");
  });

  // An array of y tooltips holds one per series, and each row's name is written the same way, so every title is escaped
  test("escapes each series' row title in an array of y tooltips, which keeps its length", () => {
    expect.hasAssertions();

    const { tooltip } = getStyledApexOptions({
      isDark: false,
      options: { tooltip: { y: [{}, { title: { formatter: (seriesName: string) => `${seriesName}%` } }] } },
      series: [],
    });
    const y = tooltip?.y;
    assert(Array.isArray(y));

    expect(y).toHaveLength(2);
    expect(y[0]?.title?.formatter?.("<b>")).toBe("&lt;b&gt;: ");
    expect(y[1]?.title?.formatter?.("<b>")).toBe("&lt;b&gt;%");
  });

  test("keeps the chart height the options name", () => {
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
