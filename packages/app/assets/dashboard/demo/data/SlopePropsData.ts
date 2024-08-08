import type { VisualPropsData } from "@/models/dashboard/VisualPropsData";

export const SlopePropsData = {
  series: [
    {
      data: [
        {
          x: "Jan",
          y: 43,
        },
        {
          x: "Feb",
          y: 58,
        },
      ],
      name: "Blue",
    },
    {
      data: [
        {
          x: "Jan",
          y: 33,
        },
        {
          x: "Feb",
          y: 38,
        },
      ],
      name: "Green",
    },
    {
      data: [
        {
          x: "Jan",
          y: 55,
        },
        {
          x: "Feb",
          y: 21,
        },
      ],
      name: "Red",
    },
  ],
} as const satisfies VisualPropsData;
