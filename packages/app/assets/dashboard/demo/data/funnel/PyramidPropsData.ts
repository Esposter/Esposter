import type { VisualPropsData } from "@/models/dashboard/VisualPropsData";

export const PyramidPropsData = {
  options: {
    colors: ["#F44F5E", "#E55A89", "#D863B1", "#CA6CD8", "#B57BED", "#8D95EB", "#62ACEA", "#4BC3E6"],
    plotOptions: {
      bar: {
        distributed: true,
      },
    },
    xaxis: {
      categories: [
        "Sweets",
        "Processed Foods",
        "Healthy Fats",
        "Meat",
        "Beans & Legumes",
        "Dairy",
        "Fruits & Vegetables",
        "Grains",
      ],
    },
  },
  series: [
    {
      data: [200, 330, 548, 740, 880, 990, 1100, 1380],
      name: "",
    },
  ],
} as const satisfies VisualPropsData;
