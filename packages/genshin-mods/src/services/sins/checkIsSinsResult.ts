import type { SinsResult } from "../../models/SinsResult";

import { SIN_NAMES } from "../../models/SinName";
import { SinStatusKind } from "../../models/SinStatusKind";
import { checkIsObject } from "../checkIsObject";

// The outcomes that hold no answers, each the reason the script could not score the prompt
const UNANSWERED_RESULTS: ReadonlySet<unknown> = new Set([
  SinStatusKind.Failed,
  SinStatusKind.NodeTooOld,
  SinStatusKind.NoKey,
]);

// An answer is read for its score alone, so the score is what is checked
const checkIsAnswer = (value: unknown): boolean => checkIsObject(value) && typeof value.score === "number";

// The script's result as the mod reads it: an answer holds a score for every sin, and each other outcome holds none
export const checkIsSinsResult = (value: unknown): value is SinsResult => {
  if (!checkIsObject(value)) return false;
  if (UNANSWERED_RESULTS.has(value.result)) return true;

  const { answers } = value;
  return (
    value.result === SinStatusKind.Answered &&
    checkIsObject(answers) &&
    SIN_NAMES.every((name) => checkIsAnswer(answers[name]))
  );
};
