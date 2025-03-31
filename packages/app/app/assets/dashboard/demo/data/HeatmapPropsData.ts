import type { VisualPropsData } from "@/models/dashboard/VisualPropsData";

import { createData } from "@/services/dashboard/demo/createData";

export const HeatmapPropsData = {
  options: {
    colors: ["#008FFB"],
  },
  series: [
    {
      data: createData(18, {
        max: 90,
        min: 0,
      }),
      name: "Metric1",
    },
    {
      data: createData(18, {
        max: 90,
        min: 0,
      }),
      name: "Metric2",
    },
    {
      data: createData(18, {
        max: 90,
        min: 0,
      }),
      name: "Metric3",
    },
    {
      data: createData(18, {
        max: 90,
        min: 0,
      }),
      name: "Metric4",
    },
    {
      data: createData(18, {
        max: 90,
        min: 0,
      }),
      name: "Metric5",
    },
    {
      data: createData(18, {
        max: 90,
        min: 0,
      }),
      name: "Metric6",
    },
    {
      data: createData(18, {
        max: 90,
        min: 0,
      }),
      name: "Metric7",
    },
    {
      data: createData(18, {
        max: 90,
        min: 0,
      }),
      name: "Metric8",
    },
    {
      data: createData(18, {
        max: 90,
        min: 0,
      }),
      name: "Metric9",
    },
  ],
} as const satisfies VisualPropsData;
