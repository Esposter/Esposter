import { BubbleType } from "@/models/dashboard/chart/type/BubbleType";
import { FunnelType } from "@/models/dashboard/chart/type/FunnelType";
import { TreemapType } from "@/models/dashboard/chart/type/TreemapType";
import { mergeObjectsStrict } from "@/util/object/mergeObjectsStrict";
import { z } from "zod";

enum BaseChartType {
  Basic = "Basic",
  DataLabels = "DataLabels",
}

export const ChartType = mergeObjectsStrict(BaseChartType, BubbleType, FunnelType, TreemapType);
export type ChartType = BaseChartType | BubbleType | FunnelType | TreemapType;

export const chartTypeSchema = z.nativeEnum(ChartType) satisfies z.ZodType<ChartType>;
