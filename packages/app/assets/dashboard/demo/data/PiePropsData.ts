import type { VisualPropsData } from "@/models/dashboard/VisualPropsData";

export const PiePropsData = {
  options: {
    labels: ["Team A", "Team B", "Team C", "Team D", "Team E"],
  },
  series: [44, 55, 13, 43, 22],
} as const satisfies VisualPropsData;
