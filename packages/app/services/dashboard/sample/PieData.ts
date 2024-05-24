import type { Pie } from "vue-chartjs";

export const PieData = {
  labels: ["VueJs", "EmberJs", "VueJs", "AngularJs"],
  datasets: [
    {
      backgroundColor: ["#41B883", "#E46651", "#00D8FF", "#DD1B16"],
      data: [40, 20, 80, 10],
    },
  ],
} as const satisfies InstanceType<typeof Pie>["data"];
