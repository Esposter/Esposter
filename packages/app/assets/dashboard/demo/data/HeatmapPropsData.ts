import type { VisualPropsData } from "@/models/dashboard/VisualPropsData";
import { generateData } from "@/services/dashboard/demo/generateData";

export const HeatmapPropsData = {
  series: [
    {
      name: "Metric1",
      data: generateData(18, {
        min: 0,
        max: 90,
      }),
    },
    {
      name: "Metric2",
      data: generateData(18, {
        min: 0,
        max: 90,
      }),
    },
    {
      name: "Metric3",
      data: generateData(18, {
        min: 0,
        max: 90,
      }),
    },
    {
      name: "Metric4",
      data: generateData(18, {
        min: 0,
        max: 90,
      }),
    },
    {
      name: "Metric5",
      data: generateData(18, {
        min: 0,
        max: 90,
      }),
    },
    {
      name: "Metric6",
      data: generateData(18, {
        min: 0,
        max: 90,
      }),
    },
    {
      name: "Metric7",
      data: generateData(18, {
        min: 0,
        max: 90,
      }),
    },
    {
      name: "Metric8",
      data: generateData(18, {
        min: 0,
        max: 90,
      }),
    },
    {
      name: "Metric9",
      data: generateData(18, {
        min: 0,
        max: 90,
      }),
    },
  ],
  options: {
    colors: ["#008FFB"],
  },
} as const satisfies VisualPropsData;
