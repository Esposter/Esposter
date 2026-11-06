import { getSurveyInsertTarget } from "@/services/resource/survey/getSurveyInsertTarget";
import { createSurveyTestDocument } from "@/services/survey/createSurveyTestDocument.test";
import { createSurveyTestPage } from "@/services/survey/createSurveyTestPage.test";
import { createSurveyTestPanelDynamic } from "@/services/survey/createSurveyTestPanelDynamic.test";
import { createSurveyTestQuestion } from "@/services/survey/createSurveyTestQuestion.test";
import { describe, expect, test } from "vitest";
import { SurveyNodeType } from "vue-survey-engine-headless";

describe(getSurveyInsertTarget, () => {
  test("takes a kind straight after the selected question, in the question's own slot", () => {
    expect.hasAssertions();

    const document = createSurveyTestDocument([
      createSurveyTestPage([createSurveyTestQuestion("question1"), createSurveyTestQuestion("question2")]),
    ]);

    expect(getSurveyInsertTarget(document, "/content/0/props/children/0", SurveyNodeType.Rating)).toStrictEqual({
      index: 1,
      slotPointer: "/content/0/props/children",
    });
  });

  test("takes a kind at the end of the first page when nothing is selected", () => {
    expect.hasAssertions();

    const document = createSurveyTestDocument([
      createSurveyTestPage([createSurveyTestQuestion("question1"), createSurveyTestQuestion("question2")]),
    ]);

    expect(getSurveyInsertTarget(document, "", SurveyNodeType.Rating)).toStrictEqual({
      index: 2,
      slotPointer: "/content/0/props/children",
    });
  });

  test("takes a kind at the end of a selected page, since no place after the page takes it", () => {
    expect.hasAssertions();

    const document = createSurveyTestDocument([
      createSurveyTestPage([createSurveyTestQuestion("question1"), createSurveyTestQuestion("question2")]),
    ]);

    expect(getSurveyInsertTarget(document, "/content/0", SurveyNodeType.Text)).toStrictEqual({
      index: 2,
      slotPointer: "/content/0/props/children",
    });
  });

  test("takes a page after a selected page, at the top level", () => {
    expect.hasAssertions();

    const document = createSurveyTestDocument([createSurveyTestPage([])]);

    expect(getSurveyInsertTarget(document, "/content/0", SurveyNodeType.Page)).toStrictEqual({
      index: 1,
      slotPointer: "/content",
    });
  });

  test("takes no kind that no place along the selection accepts", () => {
    expect.hasAssertions();

    const document = createSurveyTestDocument([
      createSurveyTestPage([createSurveyTestPanelDynamic("panel", [createSurveyTestQuestion("question1")])]),
    ]);

    expect(
      getSurveyInsertTarget(document, "/content/0/props/children/0/props/template/0", SurveyNodeType.Panel),
    ).toBeUndefined();
  });
});
