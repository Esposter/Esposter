import type { DashboardVisualData } from "@/models/dashboard/DashboardVisualData";
import { DashboardVisualType } from "@/models/dashboard/DashboardVisualType";
import { BarData } from "@/services/dashboard/sample/BarData";
import { BubbleData } from "@/services/dashboard/sample/BubbleData";
import { BubbleOptions } from "@/services/dashboard/sample/BubbleOptions";
import { DoughnutData } from "@/services/dashboard/sample/DoughnutData";
import { LineData } from "@/services/dashboard/sample/LineData";
import { PieData } from "@/services/dashboard/sample/PieData";
import { PolarAreaData } from "@/services/dashboard/sample/PolarAreaData";
import { PolarAreaOptions } from "@/services/dashboard/sample/PolarAreaOptions";
import { RadarData } from "@/services/dashboard/sample/RadarData";
import { RadarOptions } from "@/services/dashboard/sample/RadarOptions";
import { ScatterData } from "@/services/dashboard/sample/ScatterData";

export const SampleVisualDataMap = {
  [DashboardVisualType.Bar]: {
    data: BarData,
  },
  [DashboardVisualType.Bubble]: {
    data: BubbleData,
    options: BubbleOptions,
  },
  [DashboardVisualType.Doughnut]: {
    data: DoughnutData,
  },
  [DashboardVisualType.Line]: {
    data: LineData,
  },
  [DashboardVisualType.Pie]: {
    data: PieData,
  },
  [DashboardVisualType.PolarArea]: {
    data: PolarAreaData,
    options: PolarAreaOptions,
  },
  [DashboardVisualType.Radar]: {
    data: RadarData,
    options: RadarOptions,
  },
  [DashboardVisualType.Scatter]: {
    data: ScatterData,
  },
} as const satisfies Record<DashboardVisualType, DashboardVisualData>;
