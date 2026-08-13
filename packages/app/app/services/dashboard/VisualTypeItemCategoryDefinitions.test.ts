import { VisualType, VisualTypes } from "#shared/models/dashboard/data/VisualType";
import { VisualTypeItemCategoryDefinitions } from "@/services/dashboard/VisualTypeItemCategoryDefinitions";
import { describe, expect, test } from "vitest";

describe("visualTypeItemCategoryDefinitions", () => {
  test("offers every visual type", () => {
    expect.hasAssertions();

    expect(VisualTypeItemCategoryDefinitions.map(({ value }) => value)).toStrictEqual([...VisualTypes]);
  });

  test("titles a multi-word type at its word boundaries", () => {
    expect.hasAssertions();

    expect(VisualTypeItemCategoryDefinitions).toContainEqual({ title: "Box Plot", value: VisualType.BoxPlot });
  });

  test("leaves a single-word type's title as its value", () => {
    expect.hasAssertions();

    expect(VisualTypeItemCategoryDefinitions).toContainEqual({ title: VisualType.Area, value: VisualType.Area });
  });
});
