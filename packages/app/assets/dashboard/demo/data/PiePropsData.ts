import type { VisualPropsData } from "@/models/dashboard/VisualPropsData";

export const PiePropsData = {
  series: [44, 55, 13, 43, 22],
  options: {
    labels: ['Team A', 'Team B', 'Team C', 'Team D', 'Team E'],
  }
} as const satisfies VisualPropsData;
