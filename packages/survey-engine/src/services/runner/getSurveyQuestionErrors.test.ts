import { SurveyNodeType } from "#src/models/SurveyNodeType";
import { createSurveyPage } from "#src/services/runner/createSurveyPage.test";
import { createSurveyRunnerDocument } from "#src/services/runner/createSurveyRunnerDocument.test";
import { SURVEY_INVALID_ANSWER_MESSAGE, SURVEY_REQUIRED_MESSAGE } from "#src/services/runner/constants";
import { getSurveyPageViews } from "#src/services/runner/getSurveyPageViews";
import { getSurveyQuestionErrors } from "#src/services/runner/getSurveyQuestionErrors";
import { takeOne } from "@esposter/shared";
import { describe, expect, test } from "vitest";

describe(getSurveyQuestionErrors, () => {
  const now = new Date(0);
  const pointer = "/content/0/props/children/0";

  // The first view of a page holding the one element, so each case checks that element alone
  const getFirstView = (element: unknown) =>
    takeOne(getSurveyPageViews(createSurveyRunnerDocument([createSurveyPage([element])]), 0, {}, now), 0);

  test("an unanswered required question reports the required message", () => {
    expect.hasAssertions();

    const view = getFirstView({ props: { id: "a", isRequired: true, name: "a" }, type: SurveyNodeType.Text });

    expect(getSurveyQuestionErrors(view, {}, {}, now)).toStrictEqual([
      { message: SURVEY_REQUIRED_MESSAGE, name: "a", pointer },
    ]);
  });

  test("a required question with its own required text reports that text", () => {
    expect.hasAssertions();

    const view = getFirstView({
      props: { id: "a", isRequired: true, name: "a", requiredErrorText: "a" },
      type: SurveyNodeType.Text,
    });

    expect(getSurveyQuestionErrors(view, {}, {}, now)).toStrictEqual([{ message: "a", name: "a", pointer }]);
  });

  test("an unanswered optional question reports nothing", () => {
    expect.hasAssertions();

    const view = getFirstView({ props: { id: "a", name: "a" }, type: SurveyNodeType.Text });

    expect(getSurveyQuestionErrors(view, {}, {}, now)).toStrictEqual([]);
  });

  test("an answer its schema refuses reports the invalid-answer message", () => {
    expect.hasAssertions();

    const view = getFirstView({
      props: { choices: [{ value: "a" }], id: "a", name: "a" },
      type: SurveyNodeType.RadioGroup,
    });

    expect(getSurveyQuestionErrors(view, { a: "b" }, {}, now)).toStrictEqual([
      { message: SURVEY_INVALID_ANSWER_MESSAGE, name: "a", pointer },
    ]);
  });

  test("a validator that does not hold reports its text", () => {
    expect.hasAssertions();

    const view = getFirstView({
      props: { id: "a", name: "a", validators: [{ expression: "{value} = 'a'", text: "a" }] },
      type: SurveyNodeType.Text,
    });

    expect(getSurveyQuestionErrors(view, { a: "b" }, {}, now)).toStrictEqual([{ message: "a", name: "a", pointer }]);
  });

  test("a validator that holds reports nothing", () => {
    expect.hasAssertions();

    const view = getFirstView({
      props: { id: "a", name: "a", validators: [{ expression: "{value} = 'a'", text: "a" }] },
      type: SurveyNodeType.Text,
    });

    expect(getSurveyQuestionErrors(view, { a: "a" }, {}, now)).toStrictEqual([]);
  });

  test("a disabled question takes no answer, so a required one in a disabled panel reports nothing", () => {
    expect.hasAssertions();

    const view = takeOne(
      takeOne(
        getSurveyPageViews(
          createSurveyRunnerDocument([
            createSurveyPage([
              {
                props: {
                  children: [{ props: { id: "a", isRequired: true, name: "a" }, type: SurveyNodeType.Text }],
                  enableIf: "{x} = 'x'",
                  id: crypto.randomUUID(),
                },
                type: SurveyNodeType.Panel,
              },
            ]),
          ]),
          0,
          {},
          now,
        ),
        0,
      ).children,
      0,
    );

    expect(getSurveyQuestionErrors(view, {}, {}, now)).toStrictEqual([]);
  });

  test("a panel holds no answer of its own to report", () => {
    expect.hasAssertions();

    const view = getFirstView({
      props: { children: [{ props: { id: "a", name: "a" }, type: SurveyNodeType.Text }], id: crypto.randomUUID() },
      type: SurveyNodeType.Panel,
    });

    expect(getSurveyQuestionErrors(view, {}, {}, now)).toStrictEqual([]);
  });
});
