import type { VisualPropsData } from "@/models/dashboard/VisualPropsData";

import { generateData } from "@/services/dashboard/demo/generateData";

export const Bubble3DPropsData = {
  options: {
    xaxis: {
      labels: {
        rotate: 0,
      },
      tickAmount: 12,
      type: "datetime",
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
      name: "Product1",
    },
    {
      data: generateData(20, {
        max: 60,
        min: 10,
      }),
      name: "Product2",
    },
    {
      data: generateData(20, {
        max: 60,
        min: 10,
      }),
      name: "Product3",
    },
    {
      data: generateData(20, {
        max: 60,
        min: 10,
      }),
      name: "Product4",
    },
  ],
} as const satisfies VisualPropsData;
