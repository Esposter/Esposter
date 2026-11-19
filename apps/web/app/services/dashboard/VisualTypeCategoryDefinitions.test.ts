import { VisualType } from "#shared/models/dashboard/data/VisualType";
import { VisualTypeCategoryDefinitions } from "#src/services/dashboard/VisualTypeCategoryDefinitions";
import { takeOne } from "@esposter/shared";
import { describe, expect, test } from "vitest";

describe("visualTypeCategoryDefinitions", () => {
  // A group lays out other visuals, so it sits in Layout alone, and every other type is offered once among the charts
  test("offers every visual type once across the categories, with the group under Layout alone", () => {
    expect.hasAssertions();

    const chartValues = takeOne(VisualTypeCategoryDefinitions, 0).items.map(({ value }) => value);
    const layoutValues = takeOne(VisualTypeCategoryDefinitions, 1).items.map(({ value }) => value);

    expect([...chartValues, ...layoutValues].toSorted()).toStrictEqual(Object.values(VisualType).toSorted());
    expect(layoutValues).toStrictEqual([VisualType.Group]);
  });
});
