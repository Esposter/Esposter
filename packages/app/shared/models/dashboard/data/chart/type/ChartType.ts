import { BubbleType } from "#shared/models/dashboard/data/chart/type/BubbleType";
import { FunnelType } from "#shared/models/dashboard/data/chart/type/FunnelType";
import { PieType } from "#shared/models/dashboard/data/chart/type/PieType";
import { TreemapType } from "#shared/models/dashboard/data/chart/type/TreemapType";
import { mergeObjectsStrict } from "@esposter/shared";
import { z } from "zod";

enum BaseChartType {
  Basic = "Basic",
}

export const ChartType = mergeObjectsStrict(BaseChartType, BubbleType, FunnelType, PieType, TreemapType);
export type ChartType = BaseChartType | BubbleType | FunnelType | PieType | TreemapType;

export const chartTypeSchema = z.nativeEnum(ChartType) as const satisfies z.ZodType<ChartType>;
