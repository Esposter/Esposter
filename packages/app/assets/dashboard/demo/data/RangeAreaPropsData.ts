import type { VisualPropsData } from "@/models/dashboard/VisualPropsData";

export const RangeAreaPropsData = {
  series: [
    {
      name: "New York Temperature",
      data: [
        {
          x: "Jan",
          y: [-2, 4],
        },
        {
          x: "Feb",
          y: [-1, 6],
        },
        {
          x: "Mar",
          y: [3, 10],
        },
        {
          x: "Apr",
          y: [8, 16],
        },
        {
          x: "May",
          y: [13, 22],
        },
        {
          x: "Jun",
          y: [18, 26],
        },
        {
          x: "Jul",
          y: [21, 29],
        },
        {
          x: "Aug",
          y: [21, 28],
        },
        {
          x: "Sep",
          y: [17, 24],
        },
        {
          x: "Oct",
          y: [11, 18],
        },
        {
          x: "Nov",
          y: [6, 12],
        },
        {
          x: "Dec",
          y: [1, 7],
        },
      ],
    },
  ],
  options: {
    stroke: {
      curve: "monotoneCubic",
    },
    markers: {
      hover: {
        sizeOffset: 5,
      },
    },
    yaxis: {
      labels: {
        formatter: (val) => `${val}°C`,
      },
    },
  },
} as const satisfies VisualPropsData;
