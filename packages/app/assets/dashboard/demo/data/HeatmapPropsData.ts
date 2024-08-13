import type { VisualPropsData } from "@/models/dashboard/VisualPropsData";

import { generateData } from "@/services/dashboard/demo/generateData";

export const HeatmapPropsData = {
  options: {
    colors: ["#008FFB"],
  },
  series: [
    {
      data: generateData(18, {
        max: 90,
        min: 0,
      }),
      name: "Metric1",
    },
    {
      data: generateData(18, {
        max: 90,
        min: 0,
      }),
      name: "Metric2",
    },
    {
      data: generateData(18, {
        max: 90,
        min: 0,
      }),
      name: "Metric3",
    },
    {
      data: generateData(18, {
        max: 90,
        min: 0,
      }),
      name: "Metric4",
    },
    {
      data: generateData(18, {
        max: 90,
        min: 0,
      }),
      name: "Metric5",
    },
    {
      data: generateData(18, {
        max: 90,
        min: 0,
      }),
      name: "Metric6",
    },
    {
      data: generateData(18, {
        max: 90,
        min: 0,
      }),
      name: "Metric7",
    },
    {
      data: generateData(18, {
        max: 90,
        min: 0,
      }),
      name: "Metric8",
    },
    {
      data: generateData(18, {
        max: 90,
        min: 0,
      }),
      name: "Metric9",
    },
  ],
} as const satisfies VisualPropsData;
