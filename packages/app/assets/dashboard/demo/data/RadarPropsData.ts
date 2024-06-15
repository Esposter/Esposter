import type { VisualPropsData } from "@/models/dashboard/VisualPropsData";

export const RadarPropsData = {
  series: [
    {
      name: "Series 1",
      data: [80, 50, 30, 40, 100, 20],
    },
  ],
  options: {
    xaxis: {
      categories: ["January", "February", "March", "April", "May", "June"],
    },
    yaxis: {
      stepSize: 20,
    },
  },
} as const satisfies VisualPropsData;
