import type { ApexAxisChartSeries } from "apexcharts";

import type { VisualPropsData } from "@/models/dashboard/VisualPropsData";

// A card and a table read their values from axis series, so they take only the data an axis series makes
export interface AxisVisualPropsData extends VisualPropsData {
  series: ApexAxisChartSeries;
}
