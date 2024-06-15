import type { VisualPropsData } from "@/models/dashboard/VisualPropsData";

export const BasicPropsData = {
  series: [
    {
      name: "Funnel Series",
      data: [1380, 1100, 990, 880, 740, 548, 330, 200],
    },
  ],
  options: {
    xaxis: {
      categories: ["Sourced", "Screened", "Assessed", "HR Interview", "Technical", "Verify", "Offered", "Hired"],
    },
  },
} as const satisfies VisualPropsData;
