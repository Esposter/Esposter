import type { ApexChart, ApexLegendFormatterOpts, ApexOptions } from "apexcharts";

import { escapeHtml } from "#shared/util/text/escapeHtml";
import { ApexChartMarkerShapes } from "#src/services/styled/ApexChartMarkerShapes";
import { defu } from "defu";

interface StyledApexOptionsInput {
  isDark: boolean;
  options: ApexOptions;
  series: NonNullable<ApexOptions["series"]>;
  type?: ApexChart["type"];
}
// The UI library owns the theme, so the mode is pinned instead of letting ApexCharts auto-resolve it. The mode flip
// Also re-renders the chart, which re-reads the "--apx-*" design tokens (globals.css). Each series takes its own Marker
// Shape unless the caller names one. A line or an area sizes its markers to 0 in ApexCharts, so it is given a Size
// There for the shapes to be seen; every other type keeps its own. A legend entry, a tooltip's title and a tooltip
// Row's name are written with innerHTML, and a single-series chart's entries are its category values — on a dashboard,
// A Survey respondent's own answers, read by anyone once it is published — so each is escaped here, after the caller's
// Own Formatter, where no caller's options can hand it raw text. The series is set over the merge rather than inside
// It, Since defu would concatenate it with any series the options carry
export const getStyledApexOptions = ({ isDark, options, series, type }: StyledApexOptionsInput): ApexOptions => {
  const resolvedType = type ?? options.chart?.type ?? "line";
  // The y tooltips are escaped whole in getTooltipOptions, so the merge takes the tooltip options without them: defu
  // Would concatenate an array of y tooltips with the escaped one rather than replace it
  const { y: _yTooltips, ...tooltip }: NonNullable<ApexOptions["tooltip"]> = options.tooltip ?? {};
  const styledOptions = defu(
    {
      chart: { type: resolvedType },
      legend: {
        formatter: (legendName: string, formatterOptions?: ApexLegendFormatterOpts) =>
          escapeHtml(options.legend?.formatter?.(legendName, formatterOptions) ?? legendName),
      },
      theme: { mode: isDark ? "dark" : "light" },
      tooltip: getTooltipOptions(options),
    } satisfies ApexOptions,
    { ...options, tooltip },
    {
      markers: {
        shape: ApexChartMarkerShapes,
        ...(["area", "line", "rangeArea"].includes(resolvedType) ? { size: 4 } : {}),
      },
    },
  );
  return { ...styledOptions, series };
};

// Apex writes a formatter's output raw whenever it differs from the value it formatted, and a line's title is the one
// Case that differs: its x value is an index, which the chart formats into its category's name. So the title is escaped
// Whatever formatter produced it, Apex's own included. A series row's name is escaped the same way, after the default
// Separator Apex adds to it. Each y tooltip is escaped on its own, so an array holds one escaped tooltip per series
const getYTooltip = (
  yTooltip: Exclude<NonNullable<NonNullable<ApexOptions["tooltip"]>["y"]>, unknown[]> | undefined,
): Exclude<NonNullable<NonNullable<ApexOptions["tooltip"]>["y"]>, unknown[]> => ({
  ...yTooltip,
  title: {
    formatter: (
      seriesName: string,
      formatterOptions?: Parameters<NonNullable<NonNullable<NonNullable<ApexOptions["tooltip"]>["x"]>["formatter"]>>[1],
    ) =>
      escapeHtml(
        yTooltip?.title?.formatter
          ? yTooltip.title.formatter(seriesName, formatterOptions)
          : seriesName
            ? `${seriesName}: `
            : "",
      ),
  },
});
const getTooltipOptions = (options: ApexOptions): NonNullable<ApexOptions["tooltip"]> => {
  const y = options.tooltip?.y;
  return {
    x: {
      formatter: (
        value,
        formatterOptions?: Parameters<
          NonNullable<NonNullable<NonNullable<ApexOptions["tooltip"]>["x"]>["formatter"]>
        >[1],
      ) =>
        escapeHtml(
          String(
            options.tooltip?.x?.formatter
              ? options.tooltip.x.formatter(value, formatterOptions)
              : (formatterOptions?.w.formatters.xLabelFormatter(value, formatterOptions) ?? value),
          ),
        ),
    },
    y: Array.isArray(y) ? y.map((yTooltip) => getYTooltip(yTooltip)) : getYTooltip(y),
  };
};
