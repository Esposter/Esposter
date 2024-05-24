import type { Radar } from "vue-chartjs";

export const RadarOptions = {
  aspectRatio: 1.5,
} as const satisfies InstanceType<typeof Radar>["options"];
