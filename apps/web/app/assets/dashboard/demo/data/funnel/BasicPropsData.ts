import type { VisualPropsData } from "@/models/dashboard/VisualPropsData";

export const BasicPropsData = {
  options: {
    xaxis: {
      categories: ["Sourced", "Screened", "Assessed", "HR Interview", "Technical", "Verify", "Offered", "Hired"],
    },
  },
  series: [
    {
      data: [1380, 1100, 990, 880, 740, 548, 330, 200],
      name: "Funnel Series",
    },
  ],
} as const satisfies VisualPropsData;
