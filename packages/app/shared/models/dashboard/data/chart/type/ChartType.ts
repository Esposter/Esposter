import type { Type } from "arktype";

import { BubbleType } from "#shared/models/dashboard/data/chart/type/BubbleType";
import { FunnelType } from "#shared/models/dashboard/data/chart/type/FunnelType";
import { PieType } from "#shared/models/dashboard/data/chart/type/PieType";
import { TreemapType } from "#shared/models/dashboard/data/chart/type/TreemapType";
import { mergeObjectsStrict } from "@esposter/shared";
import { type } from "arktype";

enum BaseChartType {
  Basic = "Basic",
}

export const ChartType = mergeObjectsStrict(BaseChartType, BubbleType, FunnelType, PieType, TreemapType);
export type ChartType = BaseChartType | BubbleType | FunnelType | PieType | TreemapType;

export const chartTypeSchema = type.valueOf(ChartType) satisfies Type<ChartType>;
