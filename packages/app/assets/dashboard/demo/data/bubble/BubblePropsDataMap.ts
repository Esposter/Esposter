import { Bubble3DPropsData } from "@/assets/dashboard/demo/data/bubble/3DPropsData";
import { BasicPropsData } from "@/assets/dashboard/demo/data/bubble/BasicPropsData";
import { ChartType } from "@/shared/models/dashboard/data/chart/type/ChartType";

export const BubblePropsDataMap = {
  [ChartType.Basic]: BasicPropsData,
  [ChartType["3D"]]: Bubble3DPropsData,
} as const;
