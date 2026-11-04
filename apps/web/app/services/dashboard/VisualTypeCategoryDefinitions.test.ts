import { VisualType } from "#shared/models/dashboard/data/VisualType";
import { UiIconMeaning } from "@/models/ui/UiIconMeaning";
import { VisualTypeCategoryDefinitions } from "@/services/dashboard/VisualTypeCategoryDefinitions";
import { describe, expect, test } from "vitest";

describe("visualTypeCategoryDefinitions", () => {
  // A group lays out other visuals, so it sits in Layout alone, and every other type is offered once among the charts
  test("offers the group under Layout and every other type once under the charts", () => {
    expect.hasAssertions();

    expect(VisualTypeCategoryDefinitions.map(({ title }) => title)).toStrictEqual(["Charts", "Layout"]);
    expect(VisualTypeCategoryDefinitions.flatMap(({ items }) => items.map(({ value }) => value))).toHaveLength(
      Object.values(VisualType).length,
    );
    expect(VisualTypeCategoryDefinitions.at(-1)).toStrictEqual({
      items: [{ meaning: UiIconMeaning.Group, title: "Group", value: VisualType.Group }],
      title: "Layout",
    });
  });
});
