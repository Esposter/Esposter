import type { VisualPropsData } from "@/models/dashboard/VisualPropsData";
import { generateData } from "@/services/dashboard/demo/generateData";

export const BasicPropsData = {
  series: [
    {
      name: "Bubble1",
      data: generateData(20, {
        min: 10,
        max: 60,
      }),
    },
    {
      name: "Bubble2",
      data: generateData(20, {
        min: 10,
        max: 60,
      }),
    },
    {
      name: "Bubble3",
      data: generateData(20, {
        min: 10,
        max: 60,
      }),
    },
    {
      name: "Bubble4",
      data: generateData(20, {
        min: 10,
        max: 60,
      }),
    },
  ],
  options: {
    fill: {
      opacity: 0.8,
    },
    xaxis: {
      tickAmount: 12,
      type: "category",
    },
    yaxis: {
      max: 70,
    },
  },
} as const satisfies VisualPropsData;
