import type { VisualPropsData } from "@/models/dashboard/VisualPropsData";

export const RangeBarPropsData = {
  options: {
    plotOptions: {
      bar: {
        horizontal: true,
      },
    },
    xaxis: {
      type: "datetime",
    },
  },
  series: [
    {
      data: [
        {
          x: "Code",
          y: [new Date("2019-03-02").getTime(), new Date("2019-03-04").getTime()],
        },
        {
          x: "Test",
          y: [new Date("2019-03-04").getTime(), new Date("2019-03-08").getTime()],
        },
        {
          x: "Validation",
          y: [new Date("2019-03-08").getTime(), new Date("2019-03-12").getTime()],
        },
        {
          x: "Deployment",
          y: [new Date("2019-03-12").getTime(), new Date("2019-03-18").getTime()],
        },
      ],
    },
  ],
} as const satisfies VisualPropsData;
