import type { VisualPropsData } from "@/models/dashboard/VisualPropsData";

import { createData } from "@/services/dashboard/demo/createData";

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
      data: createData(20, {
        max: 60,
        min: 10,
      }),
      name: "Product1",
    },
    {
      data: createData(20, {
        max: 60,
        min: 10,
      }),
      name: "Product2",
    },
    {
      data: createData(20, {
        max: 60,
        min: 10,
      }),
      name: "Product3",
    },
    {
      data: createData(20, {
        max: 60,
        min: 10,
      }),
      name: "Product4",
    },
  ],
} as const satisfies VisualPropsData;
