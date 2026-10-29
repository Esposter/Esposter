import { ChartType } from "#shared/models/dashboard/data/chart/type/ChartType";
import { Visual } from "#shared/models/dashboard/data/Visual";
import { VisualType } from "#shared/models/dashboard/data/VisualType";
import { DatasetAggregationType } from "#shared/models/dataset/DatasetAggregationType";
import { DatasetProviderType } from "#shared/models/dataset/DatasetProviderType";
import { setVisualType } from "@/services/dashboard/setVisualType";
import { describe, expect, test } from "vitest";

const createDataset = () => ({
  query: { series: [{ aggregation: DatasetAggregationType.Count, column: "column" }], xColumn: "xColumn" },
  reference: { id: crypto.randomUUID(), type: DatasetProviderType.Sheet },
});

describe(setVisualType, () => {
  // Only Basic is offered by Scatter, so a Donut pie that switches to it has to fall back rather than keep Donut
  test("falls back to the first chart type the new visual type offers", () => {
    expect.hasAssertions();

    const visual = new Visual();
    visual.type = VisualType.Pie;
    visual.chart.type = ChartType.Donut;
    setVisualType(visual, VisualType.Scatter);

    expect(visual.type).toBe(VisualType.Scatter);
    expect(visual.chart.type).toBe(ChartType.Basic);
  });

  test("keeps the binding when the new visual type can draw it", () => {
    expect.hasAssertions();

    const visual = new Visual();
    visual.type = VisualType.Bar;
    visual.dataset = createDataset();
    const { dataset } = visual;
    setVisualType(visual, VisualType.Column);

    expect(visual.dataset).toBe(dataset);
  });

  // A bubble draws x, y and size per point, so the one-value-per-category binding has nothing it could fill
  test("drops the binding when the new visual type draws several values per point", () => {
    expect.hasAssertions();

    const visual = new Visual();
    visual.type = VisualType.Bar;
    visual.dataset = createDataset();
    setVisualType(visual, VisualType.Bubble);

    expect(visual.dataset).toBeUndefined();
  });
});
