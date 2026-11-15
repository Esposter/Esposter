import { ChartType } from "#shared/models/dashboard/data/chart/type/ChartType";
import { BasicPropsData } from "#src/assets/dashboard/demo/data/funnel/BasicPropsData";
import { PyramidPropsData } from "#src/assets/dashboard/demo/data/funnel/PyramidPropsData";

export const FunnelPropsDataMap = { [ChartType.Basic]: BasicPropsData, [ChartType.Pyramid]: PyramidPropsData } as const;
