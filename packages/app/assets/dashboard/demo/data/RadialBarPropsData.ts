import type { VisualPropsData } from "@/models/dashboard/VisualPropsData";

export const RadialBarPropsData = {
  options: {
    labels: ["Cricket"],
    plotOptions: {
      radialBar: {
        hollow: {
          size: "70%",
        },
      },
    },
  },
  series: [70],
} as const satisfies VisualPropsData;
