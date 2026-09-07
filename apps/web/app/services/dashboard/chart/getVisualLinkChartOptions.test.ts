import { Visual } from "#shared/models/dashboard/data/Visual";
import { VisualType } from "#shared/models/dashboard/data/VisualType";
import { DatasetAggregationType } from "#shared/models/dataset/DatasetAggregationType";
import { DatasetProviderType } from "#shared/models/dataset/DatasetProviderType";
import { getVisualLinkChartOptions } from "@/services/dashboard/chart/getVisualLinkChartOptions";
import { ID_SEPARATOR } from "@esposter/shared";
import { describe, expect, test } from "vitest";

describe(getVisualLinkChartOptions, () => {
  const id = crypto.randomUUID();
  const xColumn = "xColumn";
  const createBoundVisual = (visualXColumn = xColumn, type = VisualType.Area) =>
    new Visual({
      dataset: {
        query: { series: [{ aggregation: DatasetAggregationType.Sum, column: "column" }], xColumn: visualXColumn },
        reference: { id, type: DatasetProviderType.Sheet },
      },
      type,
    });

  test("groups visuals by the dataset and the column it is categorised by", () => {
    expect.hasAssertions();

    expect(getVisualLinkChartOptions(createBoundVisual(), "bar")).toStrictEqual({
      group: [DatasetProviderType.Sheet, id, xColumn].join(ID_SEPARATOR),
      link: { enabled: true },
      selection: { enabled: true },
    });
  });

  // One sheet grouped by month and the same sheet grouped by region share every row and no axis at all, so a
  // Range brushed on either would dim the other's marks by coincidence of position
  test("keeps two visuals over one dataset apart when they are categorised by different columns", () => {
    expect.hasAssertions();

    const { group } = getVisualLinkChartOptions(createBoundVisual(), "bar") ?? {};
    const { group: otherGroup } = getVisualLinkChartOptions(createBoundVisual("otherXColumn"), "bar") ?? {};

    expect(group).not.toBe(otherGroup);
  });

  // Grouping a chart with no x axis asks it to draw a selection it has no geometry for
  test.each(["donut", "pie", "polarArea", "radar", "radialBar", "treemap"] as const)(
    "leaves a %s out of the linked set",
    (chartType) => {
      expect.hasAssertions();

      expect(getVisualLinkChartOptions(createBoundVisual(), chartType)).toStrictEqual({});
    },
  );

  // An unbound visual renders demo data, so it shares its numbers with nothing
  test("leaves a visual with no dataset out of the linked set", () => {
    expect.hasAssertions();

    expect(getVisualLinkChartOptions(new Visual(), "bar")).toStrictEqual({});
  });
});
