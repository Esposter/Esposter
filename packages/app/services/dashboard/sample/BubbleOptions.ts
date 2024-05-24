import type { Bubble } from "vue-chartjs";

export const BubbleOptions = {
  aspectRatio: 1,
} as const satisfies InstanceType<typeof Bubble>["options"];
