import type { ApexChart, ApexLegendFormatterOpts, ApexOptions } from "apexcharts";

import { escapeHtml } from "#shared/util/text/escapeHtml";
import { ApexChartMarkerShapes } from "@/services/styled/ApexChartMarkerShapes";
import { defu } from "defu";

interface StyledApexOptionsInput {
  isDark: boolean;
  options: ApexOptions;
  series: NonNullable<ApexOptions["series"]>;
  type?: ApexChart["type"];
}
// The UI library owns the theme, so the mode is pinned instead of letting ApexCharts auto-resolve it. The mode flip
// Also re-renders the chart, which re-reads the "--apx-*" design tokens (globals.css). Each series takes its own
// Marker shape unless the caller names one. A line or an area sizes its markers to 0 in ApexCharts, so it is given a
// Size there for the shapes to be seen; every other type keeps its own. A legend entry is written with innerHTML, and
// A single-series chart's entries are its category values — on a dashboard, a survey respondent's own answers, read by
// Anyone once it is published — so every entry is escaped here, after the caller's own formatter, where no caller's
// Options can hand it raw text. The series is set over the merge rather than inside it, since defu would concatenate it
// With any series the options carry
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
