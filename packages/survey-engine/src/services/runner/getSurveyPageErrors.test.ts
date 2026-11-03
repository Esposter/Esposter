import { SurveyNodeType } from "#src/models/SurveyNodeType";
import { createSurveyPage } from "#src/services/runner/createSurveyPage.test";
import { createSurveyRunnerDocument } from "#src/services/runner/createSurveyRunnerDocument.test";
import { SURVEY_REQUIRED_MESSAGE } from "#src/services/runner/constants";
import { getSurveyPageErrors } from "#src/services/runner/getSurveyPageErrors";
import { describe, expect, test } from "vitest";

describe(getSurveyPageErrors, () => {
  const now = new Date(0);

  test("errors come in document order, a panel's before the questions after it", () => {
    expect.hasAssertions();

    const document = createSurveyRunnerDocument([
      createSurveyPage([
        {
          props: {
            children: [{ props: { id: "a", isRequired: true, name: "a" }, type: SurveyNodeType.Text }],
            id: crypto.randomUUID(),
          },
          type: SurveyNodeType.Panel,
        },
        { props: { id: "b", isRequired: true, name: "b" }, type: SurveyNodeType.Text },
      ]),
    ]);

    expect(getSurveyPageErrors(document, 0, {}, {}, now)).toStrictEqual([
      { message: SURVEY_REQUIRED_MESSAGE, name: "a", pointer: "/content/0/props/children/0/props/children/0" },
      { message: SURVEY_REQUIRED_MESSAGE, name: "b", pointer: "/content/0/props/children/1" },
    ]);
  });

  test("a hidden required question reports nothing", () => {
    expect.hasAssertions();

    const document = createSurveyRunnerDocument([
      createSurveyPage([
        { props: { id: "a", isRequired: true, name: "a", visibleIf: "{x} = 'x'" }, type: SurveyNodeType.Text },
      ]),
    ]);

    expect(getSurveyPageErrors(document, 0, {}, {}, now)).toStrictEqual([]);
  });
});
