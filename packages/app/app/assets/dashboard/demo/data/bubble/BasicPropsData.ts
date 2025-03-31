import type { VisualPropsData } from "@/models/dashboard/VisualPropsData";

import { createData } from "@/services/dashboard/demo/createData";

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
      data: createData(20, {
        max: 60,
        min: 10,
      }),
      name: "Bubble1",
    },
    {
      data: createData(20, {
        max: 60,
        min: 10,
      }),
      name: "Bubble2",
    },
    {
      data: createData(20, {
        max: 60,
        min: 10,
      }),
      name: "Bubble3",
    },
    {
      data: createData(20, {
        max: 60,
        min: 10,
      }),
      name: "Bubble4",
    },
  ],
} as const satisfies VisualPropsData;
