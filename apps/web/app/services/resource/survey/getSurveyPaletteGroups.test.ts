import { getSurveyPaletteGroups } from "@/services/resource/survey/getSurveyPaletteGroups";
import { SurveyNodeType } from "headless-survey-engine";
import { describe, expect, test } from "vitest";

describe(getSurveyPaletteGroups, () => {
  test("every survey kind has a category and an icon", () => {
    expect.hasAssertions();

    const items = getSurveyPaletteGroups().flatMap((group) => group.items);
    const kinds = Object.values(SurveyNodeType).filter((type) => type !== SurveyNodeType.Page);

    expect(items.map(({ kind }) => kind).toSorted()).toStrictEqual(kinds.toSorted());
    expect(items.filter(({ icon }) => icon === undefined)).toStrictEqual([]);
  });

  test("the groups are titled in the order the palette lists them", () => {
    expect.hasAssertions();

    expect(getSurveyPaletteGroups().map(({ title }) => title)).toStrictEqual([
      "Text",
      "Choice",
      "Scale and ranking",
      "Grids and repeats",
      "Content",
      "Layout",
    ]);
  });
});
