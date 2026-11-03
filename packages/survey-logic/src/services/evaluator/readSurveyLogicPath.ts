import type { SurveyLogicValue } from "#src/models/SurveyLogicValue";

import { readSurveyLogicPart } from "#src/services/evaluator/readSurveyLogicPart";

// A name read as a path through a value. The whole name is tried first as one part, then each dotted split reads its head
// As a part and its tail as a path through that. A tail of `length` reads the length of a list or a text, and zero for any
// Other value, as SurveyJS reads it
export const readSurveyLogicPath = (container: SurveyLogicValue, name: string): SurveyLogicValue => {
  const whole = readSurveyLogicPart(container, name);
  if (whole !== undefined) return whole;

  for (
    let separatorIndex = name.indexOf(".");
    separatorIndex !== -1;
    separatorIndex = name.indexOf(".", separatorIndex + 1)
  ) {
    const head = readSurveyLogicPart(container, name.slice(0, separatorIndex));
    const tail = name.slice(separatorIndex + 1);
    const value = readSurveyLogicPath(head, tail);
    if (value !== undefined) return value;
    if (tail === "length") return readSurveyLogicLength(head);
  }

  return undefined;
};

const readSurveyLogicLength = (value: SurveyLogicValue): number =>
  Array.isArray(value) || typeof value === "string" ? value.length : 0;
