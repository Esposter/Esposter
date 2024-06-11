import { Bubble3DPropsData } from "@/assets/dashboard/demo/data/bubble/3DPropsData";
import { BasicPropsData } from "@/assets/dashboard/demo/data/bubble/BasicPropsData";
import { ChartType } from "@/models/dashboard/chart/ChartType";

export const BubblePropsDataMap = {
  [ChartType.Basic]: BasicPropsData,
  [ChartType["3D"]]: Bubble3DPropsData,
} as const;
