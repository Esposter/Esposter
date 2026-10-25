import { VisualType } from "#shared/models/dashboard/data/VisualType";
import { UiIconMeaning } from "@/models/ui/UiIconMeaning";
import { VisualTypeItemCategoryDefinitions } from "@/services/dashboard/VisualTypeItemCategoryDefinitions";
import { describe, expect, test } from "vitest";

describe("visualTypeItemCategoryDefinitions", () => {
  test("titles a multi-word type at its word boundaries", () => {
    expect.hasAssertions();

    expect(VisualTypeItemCategoryDefinitions).toContainEqual({
      meaning: UiIconMeaning.Chart,
      title: "Box Plot",
      value: VisualType.BoxPlot,
    });
  });
});
