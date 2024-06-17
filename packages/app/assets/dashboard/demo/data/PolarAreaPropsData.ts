import type { VisualPropsData } from "@/models/dashboard/VisualPropsData";

export const PolarAreaPropsData = {
  series: [14, 23, 21, 17, 15, 10, 12, 17, 21],
  options: {
    fill: {
      opacity: 0.8,
    },
    stroke: {
      colors: ["#fff"],
    },
  },
} as const satisfies VisualPropsData;
