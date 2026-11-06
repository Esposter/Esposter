import type { SurveyDocument } from "headless-survey-engine";

import { EditorFindingSeverity } from "@/models/editor/EditorFindingSeverity";
import { getSurveyEditorFindings } from "@/services/resource/survey/getSurveyEditorFindings";
import { createSurveyTestPage } from "@/services/survey/createSurveyTestPage.test";
import { createSurveyTestQuestion } from "@/services/survey/createSurveyTestQuestion.test";
import { takeOne } from "@esposter/shared";
import { checkSurveyDocument, surveyRootPropsSchema } from "headless-survey-engine";
import { describe, expect, test } from "vitest";

describe(getSurveyEditorFindings, () => {
  const name = "a";

  test("The problems surface lists each finding with its node", () => {
    expect.hasAssertions();

    const duplicateQuestion = createSurveyTestQuestion(name);
    // The second question repeats the first question's name, and the calculated value repeats it as well, so the check
    // Refuses both
    const document: SurveyDocument = {
      content: [createSurveyTestPage([createSurveyTestQuestion(name), duplicateQuestion])],
      root: {
        props: {
          ...surveyRootPropsSchema.parse({}),
          calculatedValues: [{ expression: `{${name}}`, includeIntoResult: false, name }],
        },
      },
    };
    const issues = checkSurveyDocument(document);

    expect(getSurveyEditorFindings(document)).toStrictEqual([
      {
        message: takeOne(issues, 0).message,
        nodeId: duplicateQuestion.props.id,
        severity: EditorFindingSeverity.Error,
      },
      { message: takeOne(issues, 1).message, nodeId: "", severity: EditorFindingSeverity.Error },
    ]);
  });
});
