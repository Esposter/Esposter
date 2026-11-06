import { getSurveyPaletteGroups } from "@/services/resource/survey/getSurveyPaletteGroups";
import { createSurveyTestDocument } from "@/services/survey/createSurveyTestDocument.test";
import { createSurveyTestPage } from "@/services/survey/createSurveyTestPage.test";
import { createSurveyTestPanelDynamic } from "@/services/survey/createSurveyTestPanelDynamic.test";
import { createSurveyTestQuestion } from "@/services/survey/createSurveyTestQuestion.test";
import { createSurveyDocument, SurveyNodeType } from "headless-survey-engine";
import { describe, expect, test } from "vitest";

describe(getSurveyPaletteGroups, () => {
  test("every survey kind has a category and an icon", () => {
    expect.hasAssertions();

    const items = getSurveyPaletteGroups(createSurveyDocument(), "").flatMap((group) => group.items);
    const kinds = Object.values(SurveyNodeType).filter((type) => type !== SurveyNodeType.Page);

    expect(items.map(({ kind }) => kind).toSorted()).toStrictEqual(kinds.toSorted());
    expect(items.filter(({ icon }) => icon === undefined)).toStrictEqual([]);
  });

  test("the groups are titled in the order the palette lists them", () => {
    expect.hasAssertions();

    expect(getSurveyPaletteGroups(createSurveyDocument(), "").map(({ title }) => title)).toStrictEqual([
      "Text",
      "Choice",
      "Scale and ranking",
      "Grids and repeats",
      "Content",
      "Layout",
    ]);
  });

  test("a group none of whose kinds is accepted at the selection is dropped", () => {
    expect.hasAssertions();

    const document = createSurveyTestDocument([
      createSurveyTestPage([createSurveyTestPanelDynamic("panel", [createSurveyTestQuestion("question1")])]),
    ]);

    expect(
      getSurveyPaletteGroups(document, "/content/0/props/children/0/props/template/0").map(({ title }) => title),
    ).toStrictEqual(["Text", "Choice", "Scale and ranking", "Grids and repeats", "Content"]);
  });
});
