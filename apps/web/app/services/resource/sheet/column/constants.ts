import type { ApexOptions } from "apexcharts";

// What the frequency chart has room for before its bars stop being readable
export const MAX_TOP_FREQUENCIES = 10;
export const MONTH_FORMAT = "YYYY-MM";
export const BASE_CHART_OPTIONS: ApexOptions = { chart: { toolbar: { show: false } } };
