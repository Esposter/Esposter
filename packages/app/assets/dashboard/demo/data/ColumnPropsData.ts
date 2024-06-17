import type { VisualPropsData } from "@/models/dashboard/VisualPropsData";

export const ColumnPropsData = {
  series: [
    {
      name: "Net Profit",
      data: [44, 55, 57, 56, 61, 58, 63, 60, 66],
    },
    {
      name: "Revenue",
      data: [76, 85, 101, 98, 87, 105, 91, 114, 94],
    },
    {
      name: "Free Cash Flow",
      data: [35, 41, 36, 26, 45, 48, 52, 53, 41],
    },
  ],
  options: {
    plotOptions: {
      bar: {
        horizontal: false,
        columnWidth: "55%",
      },
    },
    fill: {
      opacity: 1,
    },
    stroke: {
      show: true,
      width: 2,
      colors: ["transparent"],
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
} as const satisfies VisualPropsData;
