import type { SurveyLogicValue } from "#src/models/SurveyLogicValue";

import { readSurveyLogicLength } from "#src/services/evaluator/readSurveyLogicLength";
import { readSurveyLogicPart } from "#src/services/evaluator/readSurveyLogicPart";

// A name read as a path through a value, without a memo: the whole name is tried first as one part, then each dotted split
// Reads its head as a part and hands its tail to `readTail`, which reads it through the memo. A tail of `length` reads the
// Length of a list or a text, and zero for any other value
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
    if (tail === "length") return readSurveyLogicLength(head);
  }

  return undefined;
};
