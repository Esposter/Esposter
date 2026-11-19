import type { ApexChart, ApexLegendFormatterOpts, ApexOptions } from "apexcharts";

import { escapeHtml } from "#shared/util/text/escapeHtml";
import { ApexChartMarkerShapes } from "#src/services/styled/ApexChartMarkerShapes";
import { defu } from "defu";

type ApexFormatterOpts = Parameters<NonNullable<NonNullable<NonNullable<ApexOptions["tooltip"]>["x"]>["formatter"]>>[1];

interface StyledApexOptionsInput {
  isDark: boolean;
  options: ApexOptions;
  series: NonNullable<ApexOptions["series"]>;
  type?: ApexChart["type"];
}
// The UI library owns the theme, so the mode is pinned instead of letting ApexCharts auto-resolve it. The mode flip
// Also re-renders the chart, which re-reads the "--apx-*" design tokens (globals.css). Each series takes its own
// Marker shape unless the caller names one. A line or an area sizes its markers to 0 in ApexCharts, so it is given a
// Size there for the shapes to be seen; every other type keeps its own. A legend entry, a tooltip's title and a tooltip
// Row's name are written with innerHTML, and a single-series chart's entries are its category values — on a dashboard, a
// Survey respondent's own answers, read by anyone once it is published — so each is escaped here, after the caller's own
// Formatter, where no caller's options can hand it raw text. The series is set over the merge rather than inside it,
// Since defu would concatenate it with any series the options carry
export const getStyledApexOptions = ({ isDark, options, series, type }: StyledApexOptionsInput): ApexOptions => {
  const resolvedType = type ?? options.chart?.type ?? "line";
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
    options,
    {
      markers: {
        shape: ApexChartMarkerShapes,
        ...(resolvedType === "area" || resolvedType === "line" || resolvedType === "rangeArea" ? { size: 4 } : {}),
      },
    },
  );
  return { ...styledOptions, series };
};

// Apex writes a formatter's output raw whenever it differs from the value it formatted, and a line's title is the one
// Case that differs: its x value is an index, which the chart formats into its category's name. So the title is escaped
// Whatever formatter produced it, Apex's own included. A series row's name is escaped the same way, after the default
// Separator Apex adds to it. An array of y tooltips is left to its caller, since the object here would replace it
const getTooltipOptions = (options: ApexOptions): NonNullable<ApexOptions["tooltip"]> => {
  const yTooltip = Array.isArray(options.tooltip?.y) ? undefined : options.tooltip?.y;
  return {
    x: {
      formatter: (value, formatterOptions?: ApexFormatterOpts) =>
        escapeHtml(
          String(
            options.tooltip?.x?.formatter
              ? options.tooltip.x.formatter(value, formatterOptions)
              : (formatterOptions?.w.formatters.xLabelFormatter(value, formatterOptions) ?? value),
          ),
        ),
    },
    ...(Array.isArray(options.tooltip?.y)
      ? {}
      : {
          y: {
            title: {
              formatter: (seriesName: string, formatterOptions?: ApexFormatterOpts) =>
                escapeHtml(
                  yTooltip?.title?.formatter
                    ? yTooltip.title.formatter(seriesName, formatterOptions)
                    : seriesName
                      ? `${seriesName}: `
                      : "",
                ),
            },
          },
        }),
  };
};
