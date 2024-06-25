import type { VisualPropsData } from "@/models/dashboard/VisualPropsData";

export const RadialBarPropsData = {
  series: [70],
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
} as const satisfies VisualPropsData;
