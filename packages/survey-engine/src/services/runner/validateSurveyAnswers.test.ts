import { SurveyAnswerValidationMode } from "#src/models/SurveyAnswerValidationMode";
import { SurveyNodeType } from "#src/models/SurveyNodeType";
import {
  SURVEY_INVALID_ANSWER_MESSAGE,
  SURVEY_OUT_OF_RANGE_MESSAGE,
  SURVEY_NOT_SHOWN_MESSAGE,
  SURVEY_REQUIRED_MESSAGE,
  SURVEY_UNKNOWN_QUESTION_MESSAGE,
} from "#src/services/runner/constants";
import { createSurveyPage } from "#src/services/runner/createSurveyPage.test";
import { createSurveyRunnerDocument } from "#src/services/runner/createSurveyRunnerDocument.test";
import { validateSurveyAnswers } from "#src/services/runner/validateSurveyAnswers";
import { describe, expect, test } from "vitest";

describe(validateSurveyAnswers, () => {
  const now = new Date(0);

  test("a response that answers each visible question validly has no issues", () => {
    expect.hasAssertions();

    const document = createSurveyRunnerDocument([
      createSurveyPage([
        { props: { id: "a", name: "a" }, type: SurveyNodeType.Text },
        { props: { id: "rating", name: "rating", rateCount: 5 }, type: SurveyNodeType.Rating },
      ]),
    ]);

    expect(
      validateSurveyAnswers(document, { a: "a", rating: 3 }, SurveyAnswerValidationMode.Submit, now),
    ).toStrictEqual([]);
  });

  test("an answer under a name no question holds is refused in either mode", () => {
    expect.hasAssertions();

    const document = createSurveyRunnerDocument([
      createSurveyPage([{ props: { id: "a", name: "a" }, type: SurveyNodeType.Text }]),
    ]);

    expect(validateSurveyAnswers(document, { z: "z" }, SurveyAnswerValidationMode.Draft, now)).toStrictEqual([
      { message: SURVEY_UNKNOWN_QUESTION_MESSAGE, name: "z" },
    ]);
    expect(validateSurveyAnswers(document, { z: "z" }, SurveyAnswerValidationMode.Submit, now)).toStrictEqual([
      { message: SURVEY_UNKNOWN_QUESTION_MESSAGE, name: "z" },
    ]);
  });

  test("a dynamic panel's template question is no top-level answer", () => {
    expect.hasAssertions();

    const document = createSurveyRunnerDocument([
      createSurveyPage([
        {
          props: {
            id: "dynamic",
            name: "dynamic",
            template: [{ props: { id: "inner", name: "inner" }, type: SurveyNodeType.Text }],
          },
          type: SurveyNodeType.PanelDynamic,
        },
      ]),
    ]);

    expect(validateSurveyAnswers(document, { inner: "x" }, SurveyAnswerValidationMode.Draft, now)).toStrictEqual([
      { message: SURVEY_UNKNOWN_QUESTION_MESSAGE, name: "inner" },
    ]);
  });

  test("an answer to a question that is not shown is refused on a submit and ignored on a draft", () => {
    expect.hasAssertions();

    const document = createSurveyRunnerDocument([
      createSurveyPage([
        { props: { id: "a", name: "a" }, type: SurveyNodeType.Text },
        { props: { id: "b", name: "b", visibleIf: "{a} = 'yes'" }, type: SurveyNodeType.Text },
      ]),
    ]);

    expect(validateSurveyAnswers(document, { a: "no", b: "x" }, SurveyAnswerValidationMode.Submit, now)).toStrictEqual([
      { message: SURVEY_NOT_SHOWN_MESSAGE, name: "b" },
    ]);
    expect(validateSurveyAnswers(document, { a: "no", b: "x" }, SurveyAnswerValidationMode.Draft, now)).toStrictEqual(
      [],
    );
  });

  test("a draft accepts a missing required answer, and a submit refuses it with the question named", () => {
    expect.hasAssertions();

    const document = createSurveyRunnerDocument([
      createSurveyPage([{ props: { id: "a", isRequired: true, name: "a" }, type: SurveyNodeType.Text }]),
    ]);

    expect(validateSurveyAnswers(document, {}, SurveyAnswerValidationMode.Draft, now)).toStrictEqual([]);
    expect(validateSurveyAnswers(document, {}, SurveyAnswerValidationMode.Submit, now)).toStrictEqual([
      { message: SURVEY_REQUIRED_MESSAGE, name: "a" },
    ]);
  });

  test("a required question that is hidden does not block a submit", () => {
    expect.hasAssertions();

    const document = createSurveyRunnerDocument([
      createSurveyPage([
        { props: { id: "a", isRequired: true, name: "a", visibleIf: "{x} = 'yes'" }, type: SurveyNodeType.Text },
      ]),
    ]);

    expect(validateSurveyAnswers(document, {}, SurveyAnswerValidationMode.Submit, now)).toStrictEqual([]);
  });

  test("a rating outside its scale is refused with the question named", () => {
    expect.hasAssertions();

    const document = createSurveyRunnerDocument([
      createSurveyPage([{ props: { id: "rating", name: "rating", rateCount: 5 }, type: SurveyNodeType.Rating }]),
    ]);

    expect(validateSurveyAnswers(document, { rating: 9 }, SurveyAnswerValidationMode.Draft, now)).toStrictEqual([
      { message: SURVEY_OUT_OF_RANGE_MESSAGE, name: "rating" },
    ]);
    expect(validateSurveyAnswers(document, { rating: 9 }, SurveyAnswerValidationMode.Submit, now)).toStrictEqual([
      { message: SURVEY_OUT_OF_RANGE_MESSAGE, name: "rating" },
    ]);
  });

  test("a validator that does not hold refuses the answer with its text", () => {
    expect.hasAssertions();

    const document = createSurveyRunnerDocument([
      createSurveyPage([
        {
          props: { id: "a", name: "a", validators: [{ expression: "{value} = 'a'", text: "Must be a" }] },
          type: SurveyNodeType.Text,
        },
      ]),
    ]);

    expect(validateSurveyAnswers(document, { a: "b" }, SurveyAnswerValidationMode.Draft, now)).toStrictEqual([
      { message: "Must be a", name: "a" },
    ]);
  });

  test("a text answer its pattern does not match is refused, the pattern run on the RE2 engine", () => {
    expect.hasAssertions();

    const document = createSurveyRunnerDocument([
      createSurveyPage([{ props: { id: "a", name: "a", pattern: "^[a-z]+$" }, type: SurveyNodeType.Text }]),
    ]);

    expect(validateSurveyAnswers(document, { a: "A1" }, SurveyAnswerValidationMode.Draft, now)).toStrictEqual([
      { message: SURVEY_INVALID_ANSWER_MESSAGE, name: "a" },
    ]);
  });

  test("a disabled question's answer is not checked, so an earlier answer does not refuse a submit", () => {
    expect.hasAssertions();

    const document = createSurveyRunnerDocument([
      createSurveyPage([
        { props: { id: "a", name: "a" }, type: SurveyNodeType.Text },
        {
          props: {
            enableIf: "{a} = 'yes'",
            id: "b",
            name: "b",
            validators: [{ expression: "{value} = 'z'", text: "Must be z" }],
          },
          type: SurveyNodeType.Text,
        },
      ]),
    ]);

    expect(validateSurveyAnswers(document, { a: "no", b: "x" }, SurveyAnswerValidationMode.Submit, now)).toStrictEqual(
      [],
    );
  });

  test("a calculated value kept in a result is accepted on a submit and refused on a draft", () => {
    expect.hasAssertions();

    const document = createSurveyRunnerDocument(
      [createSurveyPage([{ props: { id: "a", name: "a" }, type: SurveyNodeType.Text }])],
      [{ expression: "{a} = 'a'", includeIntoResult: true, name: "b" }],
    );

    expect(validateSurveyAnswers(document, { a: "a", b: true }, SurveyAnswerValidationMode.Submit, now)).toStrictEqual(
      [],
    );
    expect(validateSurveyAnswers(document, { a: "a", b: true }, SurveyAnswerValidationMode.Draft, now)).toStrictEqual([
      { message: SURVEY_UNKNOWN_QUESTION_MESSAGE, name: "b" },
    ]);
  });
});
