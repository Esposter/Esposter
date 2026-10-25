import type { VisualPropsData } from "@/models/dashboard/VisualPropsData";

export const CardPropsData = {
  series: [{ data: [412], name: "Count of Response" }],
} as const satisfies VisualPropsData;
