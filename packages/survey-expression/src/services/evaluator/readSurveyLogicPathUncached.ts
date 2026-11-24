import type { SurveyLogicValue } from "#src/models/SurveyLogicValue";

import { readSurveyLogicPart } from "#src/services/evaluator/readSurveyLogicPart";

// A name read as a path through a value, without a memo: the whole name is tried first as one part.
// Then each dotted prefix is split off as a head, and its tail goes to `readTail`, which reads it through the memo.
// A tail of `length` is no read of its own.
// A missing one is read by the caller, once the whole name has failed, so a zero never counts as a value here.
export const readSurveyLogicPathUncached = (
  container: SurveyLogicValue,
  name: string,
  readTail: (head: SurveyLogicValue, tail: string) => SurveyLogicValue,
): SurveyLogicValue => {
  const whole = readSurveyLogicPart(container, name);
  if (whole !== undefined) return whole;

  for (
    let separatorIndex = name.indexOf(".");
    separatorIndex !== -1;
    separatorIndex = name.indexOf(".", separatorIndex + 1)
  ) {
    const head = readSurveyLogicPart(container, name.slice(0, separatorIndex));
    const tail = name.slice(separatorIndex + 1);
    const value = readTail(head, tail);
    if (value !== undefined) return value;
  }

  return undefined;
};
