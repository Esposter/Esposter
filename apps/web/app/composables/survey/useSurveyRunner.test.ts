import { useSurveyRunner } from "@/composables/survey/useSurveyRunner";
import {
  createSurveyTestDocument,
  createSurveyTestPage,
  createSurveyTestQuestion,
} from "@/services/survey/createSurveyTestDocument.test";
import { describe, expect, test } from "vitest";

describe(useSurveyRunner, () => {
  test("moves through a two-page document once the page's required question is answered", () => {
    expect.hasAssertions();

    const surveyDocument = createSurveyTestDocument([
      createSurveyTestPage([createSurveyTestQuestion("first", { isRequired: true })]),
      createSurveyTestPage([createSurveyTestQuestion("second")]),
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

    const surveyDocument = createSurveyTestDocument([
      createSurveyTestPage([
        createSurveyTestQuestion("first", { isRequired: true }),
        createSurveyTestQuestion("second", { isRequired: true }),
      ]),
      createSurveyTestPage([createSurveyTestQuestion("third")]),
    ]);
    const runner = useSurveyRunner(surveyDocument);
    runner.next();

    expect(runner.state.value.pageIndex).toBe(0);
    expect(runner.errors.value.map((error) => error.name)).toStrictEqual(["first", "second"]);
  });

  test("a page hidden by its condition is skipped when moving forward", () => {
    expect.hasAssertions();

    const surveyDocument = createSurveyTestDocument([
      createSurveyTestPage([createSurveyTestQuestion("first")]),
      createSurveyTestPage([createSurveyTestQuestion("second")], "{first} = 'show'"),
      createSurveyTestPage([createSurveyTestQuestion("third")]),
    ]);
    const runner = useSurveyRunner(surveyDocument);
    runner.next();

    expect(runner.state.value.pageIndex).toBe(2);
  });

  test("numbers the questions of the current page on from the pages before it", () => {
    expect.hasAssertions();

    const surveyDocument = createSurveyTestDocument([
      createSurveyTestPage([createSurveyTestQuestion("first")]),
      createSurveyTestPage([createSurveyTestQuestion("second")]),
    ]);
    surveyDocument.root.props.showQuestionNumbers = true;
    const runner = useSurveyRunner(surveyDocument, { pageIndex: 1 });

    expect(Array.from(runner.questionNumbers.value.values())).toStrictEqual([1, 2]);
  });

  test("numbers no question when the survey's question numbering is off", () => {
    expect.hasAssertions();

    const surveyDocument = createSurveyTestDocument([
      createSurveyTestPage([createSurveyTestQuestion("first")]),
      createSurveyTestPage([createSurveyTestQuestion("second")]),
    ]);
    const runner = useSurveyRunner(surveyDocument, { pageIndex: 1 });

    expect(runner.questionNumbers.value.size).toBe(0);
  });
});
