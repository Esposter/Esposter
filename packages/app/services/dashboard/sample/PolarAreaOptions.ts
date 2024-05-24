import type { PolarArea } from "vue-chartjs";

export const PolarAreaOptions = {
  aspectRatio: 1.5,
} as const satisfies InstanceType<typeof PolarArea>["options"];
