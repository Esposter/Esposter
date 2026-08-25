import type { Visual } from "#shared/models/dashboard/data/Visual";
import type { ApexOptions } from "apexcharts";

import { ID_SEPARATOR } from "@esposter/shared";

// Brushing a range only says something where there is an x axis to brush. A pie, a radial, a radar and a treemap
// Have none, and grouping one with the axis charts asks it to draw a selection it has no geometry for
const NonAxisChartTypes: ReadonlySet<string> = new Set(["donut", "pie", "polarArea", "radar", "radialBar", "treemap"]);

// Which visuals move together when one of them is brushed. Visuals over the same dataset are the only set worth
// Linking: they share an x column, so a range selected on one names the same rows on the others — where two
// Unrelated datasets would dim each other's marks by coincidence of number. An unbound visual renders demo data
// And belongs to no set at all
export const getVisualLinkChartOptions = (
  visual: Visual,
  chartType: NonNullable<ApexOptions["chart"]>["type"],
): ApexOptions["chart"] => {
  const reference = visual.dataset?.reference;
  if (!reference || !chartType || NonAxisChartTypes.has(chartType)) return {};

  return {
    group: `${reference.type}${ID_SEPARATOR}${reference.id}`,
    link: { enabled: true },
    selection: { enabled: true },
  };
};
