import type { Visual } from "#shared/models/dashboard/data/Visual";
import type { ApexOptions } from "apexcharts";

import { ID_SEPARATOR } from "@esposter/shared";

// Brushing a range only says something where there is an x axis to brush. A pie, a radial, a radar and a treemap
// Have none, and grouping one with the axis charts asks it to draw a selection it has no geometry for
const NonAxisChartTypes: ReadonlySet<string> = new Set(["donut", "pie", "polarArea", "radar", "radialBar", "treemap"]);

// Which visuals move together when one of them is brushed. The set is the dataset **and the column it is
// Categorised by**, because that pair is what makes one chart's x axis mean the same thing as another's: two
// Visuals over one sheet, one grouped by month and one by region, share every row and no axis at all, so a range
// Brushed on either would dim the other's marks by coincidence of position. An unbound visual renders demo data
// And belongs to no set
export const getVisualLinkChartOptions = (
  visual: Visual,
  chartType: NonNullable<ApexOptions["chart"]>["type"],
): ApexOptions["chart"] => {
  const binding = visual.dataset;
  if (!binding || !chartType || NonAxisChartTypes.has(chartType)) return {};

  const { query, reference } = binding;
  return {
    group: [reference.type, reference.id, query.xColumn].join(ID_SEPARATOR),
    link: { enabled: true },
    selection: { enabled: true },
  };
};
