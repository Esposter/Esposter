import type { VisualPropsData } from "@/models/dashboard/VisualPropsData";
import type { ApexAxisChartSeries } from "apexcharts";

// A card and a table read their values from axis series, so they take only the data an axis series makes
export interface AxisVisualPropsData extends VisualPropsData {
  series: ApexAxisChartSeries;
}
