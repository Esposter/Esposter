import type { Visual } from "#shared/models/dashboard/data/Visual";

import { VisualDatasetShape } from "@/models/dashboard/VisualDatasetShape";
import { VisualTypeChartTypesMap } from "@/services/dashboard/chart/VisualTypeChartTypesMap";
import { VisualTypeDatasetShapeMap } from "@/services/dashboard/dataset/VisualTypeDatasetShapeMap";
import { takeOne } from "@esposter/shared";

// Switches a visual to another type in place. Chart types are per visual type, so a switch that leaves the old one
// Unavailable falls back to the first the new type offers rather than keeping a value its own schema does not accept.
// A type that draws several values per point has nothing a binding could give it, so the binding goes with the switch
// Rather than staying saved behind a chart that cannot draw it
export const setVisualType = (visual: Visual, type: Visual["type"]) => {
  visual.type = type;
  const chartTypes = VisualTypeChartTypesMap[type];
  if (!chartTypes.includes(visual.chart.type)) visual.chart.type = takeOne(chartTypes);
  if (VisualTypeDatasetShapeMap[type] === VisualDatasetShape.None) visual.dataset = undefined;
};
