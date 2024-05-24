import type { PolarArea } from "vue-chartjs";

export const PolarAreaData = {
  labels: ["Eating", "Drinking", "Sleeping", "Designing", "Coding", "Cycling", "Running"],
  datasets: [
    {
      label: "My First dataset",
      backgroundColor: "rgba(179,181,198,0.5)",
      data: [65, 59, 90, 81, 56, 55, 40],
    },
    {
      label: "My Second dataset",
      backgroundColor: "rgba(255,99,132,0.5)",
      data: [28, 48, 40, 19, 96, 27, 100],
    },
  ],
} as const satisfies InstanceType<typeof PolarArea>["data"];
