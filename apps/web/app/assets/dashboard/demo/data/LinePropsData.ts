import type { VisualPropsData } from "@/models/dashboard/VisualPropsData";

export const LinePropsData = {
  options: {
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
  series: [
    {
      data: [10, 41, 35, 51, 49, 62, 69, 91, 148],
      name: "Desktops",
    },
  ],
} as const satisfies VisualPropsData;
