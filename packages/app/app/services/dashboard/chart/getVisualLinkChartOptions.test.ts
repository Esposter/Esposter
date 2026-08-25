import { Visual } from "#shared/models/dashboard/data/Visual";
import { VisualType } from "#shared/models/dashboard/data/VisualType";
import { DatasetAggregationType } from "#shared/models/dataset/DatasetAggregationType";
import { DatasetProviderType } from "#shared/models/dataset/DatasetProviderType";
import { getVisualLinkChartOptions } from "@/services/dashboard/chart/getVisualLinkChartOptions";
import { ID_SEPARATOR } from "@esposter/shared";
import { describe, expect, test } from "vitest";

describe(getVisualLinkChartOptions, () => {
  const id = crypto.randomUUID();
  const createBoundVisual = (type = VisualType.Area) =>
    new Visual({
      dataset: {
        query: { series: [{ aggregation: DatasetAggregationType.Sum, column: "column" }], xColumn: "xColumn" },
        reference: { id, type: DatasetProviderType.Sheet },
      },
      type,
    });

  test("groups visuals by the dataset they read, so a range brushed on one names the same rows on the others", () => {
    expect.hasAssertions();

    expect(getVisualLinkChartOptions(createBoundVisual(), "bar")).toStrictEqual({
      group: `${DatasetProviderType.Sheet}${ID_SEPARATOR}${id}`,
      link: { enabled: true },
      selection: { enabled: true },
    });
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
