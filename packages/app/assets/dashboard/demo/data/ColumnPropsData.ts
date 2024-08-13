import type { VisualPropsData } from "@/models/dashboard/VisualPropsData";

export const ColumnPropsData = {
  options: {
    fill: {
      opacity: 1,
    },
    plotOptions: {
      bar: {
        columnWidth: "55%",
        horizontal: false,
      },
    },
    stroke: {
      colors: ["transparent"],
      show: true,
      width: 2,
    },
    tooltip: {
      y: {
        formatter: (val) => `$ ${val} thousands`,
      },
    },
    xaxis: {
      categories: ["Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct"],
    },
    yaxis: {
      title: {
        text: "$ (thousands)",
      },
    },
  },
  series: [
    {
      data: [44, 55, 57, 56, 61, 58, 63, 60, 66],
      name: "Net Profit",
    },
    {
      data: [76, 85, 101, 98, 87, 105, 91, 114, 94],
      name: "Revenue",
    },
    {
      data: [35, 41, 36, 26, 45, 48, 52, 53, 41],
      name: "Free Cash Flow",
    },
  ],
} as const satisfies VisualPropsData;
