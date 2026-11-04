import { SurveyNodeType } from "#src/models/SurveyNodeType";
import { SURVEY_REQUIRED_MESSAGE } from "#src/services/runner/constants";
import { createSurveyPage } from "#src/services/runner/createSurveyPage.test";
import { createSurveyRunnerDocument } from "#src/services/runner/createSurveyRunnerDocument.test";
import { createSurveyRunnerState } from "#src/services/runner/createSurveyRunnerState";
import { validateSurveyPage } from "#src/services/runner/validateSurveyPage";
import { describe, expect, test } from "vitest";

describe(validateSurveyPage, () => {
  const now = new Date(0);

  test("a required question left empty reports an error, and each one is named in document order", () => {
    expect.hasAssertions();

    const document = createSurveyRunnerDocument([
      createSurveyPage([
        { props: { id: "a", isRequired: true, name: "a" }, type: SurveyNodeType.Text },
        { props: { id: "b", isRequired: true, name: "b" }, type: SurveyNodeType.Text },
      ]),
    ]);

    expect(validateSurveyPage(document, createSurveyRunnerState(document, {}, 0), now)).toStrictEqual([
      { message: SURVEY_REQUIRED_MESSAGE, name: "a", pointer: "/content/0/props/children/0" },
      { message: SURVEY_REQUIRED_MESSAGE, name: "b", pointer: "/content/0/props/children/1" },
    ]);
  });

  test("only the state's current page is validated", () => {
    expect.hasAssertions();

    const document = createSurveyRunnerDocument([
      createSurveyPage([{ props: { id: "a", name: "a" }, type: SurveyNodeType.Text }]),
      createSurveyPage([{ props: { id: "b", isRequired: true, name: "b" }, type: SurveyNodeType.Text }]),
    ]);

    expect(validateSurveyPage(document, createSurveyRunnerState(document, {}, 0), now)).toStrictEqual([]);
  });
});
