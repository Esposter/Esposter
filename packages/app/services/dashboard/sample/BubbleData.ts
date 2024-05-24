import { generateRandomNumber } from "@/util/math/random/generateRandomNumber";
import type { Bubble } from "vue-chartjs";

export const BubbleData = {
  labels: ["January", "February", "March", "April", "May", "June", "July"],
  datasets: [
    {
      label: "My First Dataset",
      backgroundColor: "rgb(255, 99, 132)",
      borderColor: "rgb(255, 99, 132)",
      data: Array(7).map(() => ({
        x: generateRandomNumber(100),
        y: generateRandomNumber(100),
        v: Math.round(Math.random() * 30) + 10,
      })),
    },
    {
      label: "My Second Dataset",
      backgroundColor: "rgb(54, 162, 235)",
      borderColor: "rgb(54, 162, 235)",
      borderWidth: 3,
      data: Array(7).map(() => ({
        x: generateRandomNumber(100),
        y: generateRandomNumber(100),
        v: Math.round(Math.random() * 30) + 10,
      })),
    },
  ],
} as const satisfies InstanceType<typeof Bubble>["data"];
