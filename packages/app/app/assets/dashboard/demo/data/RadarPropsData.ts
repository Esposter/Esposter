import type { VisualPropsData } from "@/models/dashboard/VisualPropsData";

export const RadarPropsData = {
  options: {
    xaxis: {
      categories: ["January", "February", "March", "April", "May", "June"],
    },
    yaxis: {
      stepSize: 20,
    },
  },
  series: [
    {
      data: [80, 50, 30, 40, 100, 20],
      name: "Series 1",
    },
  ],
} as const satisfies VisualPropsData;
