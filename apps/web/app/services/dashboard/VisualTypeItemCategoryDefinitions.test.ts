import { VisualType } from "#shared/models/dashboard/data/VisualType";
import { UiIconMeaning } from "@/models/ui/UiIconMeaning";
import { VisualTypeItemCategoryDefinitions } from "@/services/dashboard/VisualTypeItemCategoryDefinitions";
import { describe, expect, test } from "vitest";

describe("visualTypeItemCategoryDefinitions", () => {
  test("leads with a card and a table, then offers every other type once", () => {
    expect.hasAssertions();

    const values = VisualTypeItemCategoryDefinitions.map(({ value }) => value);

    expect(values.slice(0, 2)).toStrictEqual([VisualType.Card, VisualType.Table]);
    expect(new Set(values)).toStrictEqual(
      new Set(Object.values(VisualType).filter((visualType) => visualType !== VisualType.Group)),
    );
  });

  test("titles a multi-word type at its word boundaries", () => {
    expect.hasAssertions();

    expect(VisualTypeItemCategoryDefinitions).toContainEqual({
      meaning: UiIconMeaning.Chart,
      title: "Box Plot",
      value: VisualType.BoxPlot,
    });
  });
});
