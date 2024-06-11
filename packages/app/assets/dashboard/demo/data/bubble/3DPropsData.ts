import type { VisualPropsData } from "@/models/dashboard/VisualPropsData";
import { generateData } from "@/services/dashboard/demo/generateData";

export const Bubble3DPropsData = {
  type: "bubble",
  series: [
    {
      name: "Product1",
      data: generateData(20, {
        min: 10,
        max: 60,
      }),
    },
    {
      name: "Product2",
      data: generateData(20, {
        min: 10,
        max: 60,
      }),
    },
    {
      name: "Product3",
      data: generateData(20, {
        min: 10,
        max: 60,
      }),
    },
    {
      name: "Product4",
      data: generateData(20, {
        min: 10,
        max: 60,
      }),
    },
  ],
  options: {
    fill: {
      type: "gradient",
    },
    theme: {
      palette: "palette2",
    },
    xaxis: {
      tickAmount: 12,
      type: "datetime",
      labels: {
        rotate: 0,
      },
    },
    yaxis: {
      max: 70,
    },
  },
} as const satisfies VisualPropsData;
