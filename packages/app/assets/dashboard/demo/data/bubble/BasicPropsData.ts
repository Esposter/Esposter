import type { VisualPropsData } from "@/models/dashboard/VisualPropsData";

import { generateData } from "@/services/dashboard/demo/generateData";

export const BasicPropsData = {
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
  series: [
    {
      data: generateData(20, {
        max: 60,
        min: 10,
      }),
      name: "Bubble1",
    },
    {
      data: generateData(20, {
        max: 60,
        min: 10,
      }),
      name: "Bubble2",
    },
    {
      data: generateData(20, {
        max: 60,
        min: 10,
      }),
      name: "Bubble3",
    },
    {
      data: generateData(20, {
        max: 60,
        min: 10,
      }),
      name: "Bubble4",
    },
  ],
} as const satisfies VisualPropsData;
