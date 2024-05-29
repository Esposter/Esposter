import type { VisualData } from "@/models/dashboard/VisualData";

export const LineData = {
  type: "line",
  series: [
    {
      name: "Desktops",
      data: [10, 41, 35, 51, 49, 62, 69, 91, 148],
    },
  ],
  options: {
    dataLabels: {
      enabled: false,
    },
    grid: {
      row: {
        colors: ["#f3f3f3", "transparent"],
        opacity: 0.5,
      },
    },
    stroke: {
      curve: "straight",
    },
    xaxis: {
      categories: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep"],
    },
  },
} as const satisfies VisualData;
