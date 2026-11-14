import { useSurveyRunner } from "#src/composables/useSurveyRunner";
import { SurveyNodeType } from "#src/models/SurveyNodeType";
import { createSurveyPage } from "#src/services/runner/createSurveyPage.test";
import { createSurveyRunnerDocument } from "#src/services/runner/createSurveyRunnerDocument.test";
import { v7 } from "uuid";
import { describe, expect, test } from "vitest";

// A text question under its name, held to the required and visibility flags a test sets
const createTextQuestion = (name: string, props: { isRequired?: boolean; visibleIf?: string } = {}) => ({
  props: { id: v7(), name, ...props },
  type: SurveyNodeType.Text,
});

describe(useSurveyRunner, () => {
  test("moves through a two-page document once the page's required question is answered", () => {
    expect.hasAssertions();

    const surveyDocument = createSurveyRunnerDocument([
      createSurveyPage([createTextQuestion("first", { isRequired: true })]),
      createSurveyPage([createTextQuestion("second")]),
    ]);
    const runner = useSurveyRunner(surveyDocument);
    runner.next();

    expect(runner.state.value.pageIndex).toBe(0);
    runner.setAnswer("first", "a");
    runner.next();

    expect(runner.state.value.pageIndex).toBe(1);
    expect(runner.isFirstPage.value).toBe(false);
    expect(runner.isLastPage.value).toBe(true);
    expect(runner.progress.value).toStrictEqual({ current: 2, total: 2 });
  });

  test("a move blocked by two required questions names the first one", () => {
    expect.hasAssertions();

    const surveyDocument = createSurveyRunnerDocument([
      createSurveyPage([
        createTextQuestion("first", { isRequired: true }),
        createTextQuestion("second", { isRequired: true }),
      ]),
      createSurveyPage([createTextQuestion("third")]),
    ]);
    const runner = useSurveyRunner(surveyDocument);
    runner.next();

    expect(runner.state.value.pageIndex).toBe(0);
    expect(runner.errors.value.map((error) => error.name)).toStrictEqual(["first", "second"]);
  });

  test("a page hidden by its condition is skipped when moving forward", () => {
    expect.hasAssertions();

    const surveyDocument = createSurveyRunnerDocument([
      createSurveyPage([createTextQuestion("first")]),
      createSurveyPage([createTextQuestion("second")], "{first} = 'show'"),
      createSurveyPage([createTextQuestion("third")]),
    ]);
    const runner = useSurveyRunner(surveyDocument);
    runner.next();

    expect(runner.state.value.pageIndex).toBe(2);
  });

  test("numbers the questions of the current page on from the pages before it", () => {
    expect.hasAssertions();

    const surveyDocument = createSurveyRunnerDocument([
      createSurveyPage([createTextQuestion("first")]),
      createSurveyPage([createTextQuestion("second")]),
    ]);
    surveyDocument.root.props.isQuestionNumbersVisible = true;
    const runner = useSurveyRunner(surveyDocument, { pageIndex: 1 });

    expect([...runner.questionNumbers.value.values()]).toStrictEqual([1, 2]);
  });

  test("numbers no question when the survey's question numbering is off", () => {
    expect.hasAssertions();

    const surveyDocument = createSurveyRunnerDocument([
      createSurveyPage([createTextQuestion("first")]),
      createSurveyPage([createTextQuestion("second")]),
    ]);
    const runner = useSurveyRunner(surveyDocument, { pageIndex: 1 });

    expect(runner.questionNumbers.value.size).toBe(0);
  });
});
