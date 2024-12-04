import type { VisualPropsData } from "@/models/dashboard/VisualPropsData";

export const AreaPropsData = {
  options: {
    legend: {
      horizontalAlign: "left",
    },
    stroke: {
      curve: "straight",
    },
    xaxis: {
      type: "datetime",
    },
    yaxis: {
      opposite: true,
    },
  },
  series: [
    {
      data: [
        { x: new Date("2017/11/13").getTime(), y: 8107.85 },
        { x: new Date("2017/11/14").getTime(), y: 8128 },
        { x: new Date("2017/11/15").getTime(), y: 8122.9 },
        { x: new Date("2017/11/16").getTime(), y: 8165.5 },
        { x: new Date("2017/11/17").getTime(), y: 8340.7 },
        { x: new Date("2017/11/20").getTime(), y: 8423.7 },
        { x: new Date("2017/11/21").getTime(), y: 8423.5 },
        { x: new Date("2017/11/22").getTime(), y: 8514.3 },
        { x: new Date("2017/11/23").getTime(), y: 8481.85 },
        { x: new Date("2017/11/24").getTime(), y: 8487.7 },
        { x: new Date("2017/11/27").getTime(), y: 8506.9 },
        { x: new Date("2017/11/28").getTime(), y: 8626.2 },
        { x: new Date("2017/11/29").getTime(), y: 8668.95 },
        { x: new Date("2017/11/30").getTime(), y: 8602.3 },
        { x: new Date("2017/12/01").getTime(), y: 8607.55 },
        { x: new Date("2017/12/04").getTime(), y: 8512.9 },
        { x: new Date("2017/12/05").getTime(), y: 8496.25 },
        { x: new Date("2017/12/06").getTime(), y: 8600.65 },
        { x: new Date("2017/12/07").getTime(), y: 8881.1 },
        { x: new Date("2017/12/08").getTime(), y: 9340.85 },
      ],
      name: "STOCK ABC",
    },
  ],
} as const satisfies VisualPropsData;
