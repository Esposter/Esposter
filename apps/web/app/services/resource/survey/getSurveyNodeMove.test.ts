import { SurveyNodeMoveType } from "#src/models/resource/survey/SurveyNodeMoveType";
import { getSurveyNodeMove } from "#src/services/resource/survey/getSurveyNodeMove";
import { createSurveyTestDocument } from "#src/services/survey/createSurveyTestDocument.test";
import { createSurveyTestPage } from "#src/services/survey/createSurveyTestPage.test";
import { createSurveyTestQuestion } from "#src/services/survey/createSurveyTestQuestion.test";
import { describe, expect, test } from "vitest";

describe(getSurveyNodeMove, () => {
  test.each([
    [SurveyNodeMoveType.Down, "/content/0/props/children/1", "It is last in its slot"],
    [SurveyNodeMoveType.Up, "/content/0/props/children/0", "It is first in its slot"],
    [SurveyNodeMoveType.IntoPrevious, "/content/0/props/children/0", "There is no element before it"],
    [SurveyNodeMoveType.Out, "/content/0", "It is already at the top level"],
  ])("refuses a move %s with its reason, and no operations", (moveType, nodePointer, refusal) => {
    expect.hasAssertions();

    const document = createSurveyTestDocument([
      createSurveyTestPage([createSurveyTestQuestion("question1"), createSurveyTestQuestion("question2")]),
    ]);

    expect(getSurveyNodeMove(document, nodePointer, moveType)).toStrictEqual({ operations: [], refusal });
  });

  test("lands a move the selection can take, with its operations and no reason", () => {
    expect.hasAssertions();

    const document = createSurveyTestDocument([
      createSurveyTestPage([createSurveyTestQuestion("question1"), createSurveyTestQuestion("question2")]),
    ]);
    const { operations, refusal } = getSurveyNodeMove(document, "/content/0/props/children/0", SurveyNodeMoveType.Down);

    expect(refusal).toBe("");
    expect(operations).toHaveLength(2);
  });
});
