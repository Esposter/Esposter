import { Visual } from "#shared/models/dashboard/data/Visual";
import { VisualType } from "#shared/models/dashboard/data/VisualType";
import { DatasetAggregationType } from "#shared/models/dataset/DatasetAggregationType";
import { DatasetProviderType } from "#shared/models/dataset/DatasetProviderType";
import { getVisualLinkChartOptions } from "#src/services/dashboard/chart/getVisualLinkChartOptions";
import { createBoundVisual } from "#src/services/dashboard/createBoundVisual.test";
import { v7 } from "uuid";
import { describe, expect, test } from "vitest";

describe(getVisualLinkChartOptions, () => {
  const id = v7();
  const xColumn = "xColumn";
  // Every visual here reads the one sheet, so the ones categorised alike share a group and the rest do not
  const createVisual = (visualXColumn = xColumn, type: VisualType = VisualType.Area) =>
    createBoundVisual({
      query: { series: [{ aggregation: DatasetAggregationType.Sum, column: "column" }], xColumn: visualXColumn },
      reference: { id, type: DatasetProviderType.Sheet },
      type,
    });

  test("groups visuals by the dataset and the column it is categorised by", () => {
    expect.hasAssertions();

    const { group } = getVisualLinkChartOptions(createVisual(), "bar") ?? {};

    expect(getVisualLinkChartOptions(createVisual(xColumn, VisualType.Bar), "bar")).toStrictEqual({
      group,
      link: { enabled: true },
      selection: { enabled: true },
    });
  });

  // One sheet grouped by month and the same sheet grouped by region share every row and no axis at all, so a
  // Range brushed on either would dim the other's marks by coincidence of position
  test("keeps two visuals over one dataset apart when they are categorised by different columns", () => {
    expect.hasAssertions();

    const { group } = getVisualLinkChartOptions(createVisual(), "bar") ?? {};
    const { group: otherGroup } = getVisualLinkChartOptions(createVisual("otherXColumn"), "bar") ?? {};

    expect(group).not.toBe(otherGroup);
  });

  // Grouping a chart with no x axis asks it to draw a selection it has no geometry for
  test.each(["donut", "pie", "polarArea", "radar", "radialBar", "treemap"] as const)(
    "leaves a %s out of the linked set",
    (chartType) => {
      expect.hasAssertions();

      expect(getVisualLinkChartOptions(createVisual(), chartType)).toStrictEqual({});
    },
  );

  // An unbound visual renders demo data, so it shares its numbers with nothing
  test("leaves a visual with no dataset out of the linked set", () => {
    expect.hasAssertions();

    expect(getVisualLinkChartOptions(new Visual(), "bar")).toStrictEqual({});
  });
});
