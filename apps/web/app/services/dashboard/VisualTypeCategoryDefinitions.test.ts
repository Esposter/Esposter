import { VisualType } from "#shared/models/dashboard/data/VisualType";
import { UiIconMeaning } from "@/models/ui/UiIconMeaning";
import { VisualTypeCategoryDefinitions } from "@/services/dashboard/VisualTypeCategoryDefinitions";
import { takeOne } from "@esposter/shared";
import { describe, expect, test } from "vitest";

describe("visualTypeCategoryDefinitions", () => {
  test("lists the charts first and the layout types after them", () => {
    expect.hasAssertions();

    expect(VisualTypeCategoryDefinitions.map(({ title }) => title)).toStrictEqual(["Charts", "Layout"]);
  });

  // A group lays out other visuals, so it sits in Layout alone, and every other type is offered once among the charts
  test("offers the group under Layout and every other type once under the charts", () => {
    expect.hasAssertions();

    const chartValues = takeOne(VisualTypeCategoryDefinitions, 0).items.map(({ value }) => value);

    expect(chartValues.slice(0, 2)).toStrictEqual([VisualType.Card, VisualType.Table]);
    expect(new Set(chartValues)).toStrictEqual(
      new Set(Object.values(VisualType).filter((visualType) => visualType !== VisualType.Group)),
    );
    expect(VisualTypeCategoryDefinitions.at(-1)).toStrictEqual({
      items: [{ meaning: UiIconMeaning.Group, title: "Group", value: VisualType.Group }],
      title: "Layout",
    });
  });

  test("titles a multi-word chart at its word boundaries", () => {
    expect.hasAssertions();

    expect(takeOne(VisualTypeCategoryDefinitions, 0).items).toContainEqual({
      meaning: UiIconMeaning.Chart,
      title: "Box Plot",
      value: VisualType.BoxPlot,
    });
  });
});
