import type { VisualPropsData } from "@/models/dashboard/VisualPropsData";

export const PolarAreaPropsData = {
  options: {
    fill: {
      opacity: 0.8,
    },
    stroke: {
      colors: ["#fff"],
    },
  },
  series: [14, 23, 21, 17, 15, 10, 12, 17, 21],
} as const satisfies VisualPropsData;
