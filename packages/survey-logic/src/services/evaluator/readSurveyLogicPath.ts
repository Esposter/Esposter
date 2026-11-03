import type { SurveyLogicValue } from "#src/models/SurveyLogicValue";

import { readSurveyLogicPart } from "#src/services/evaluator/readSurveyLogicPart";

// Each (container, tail) pair is read once per call: a name's dotted splits reach the same tail through several heads, so
// Without it an unresolved name costs 2^dots reads. The memo is kept only for the one call, since a value may change between calls
type PathMemo = Map<SurveyLogicValue, Map<string, SurveyLogicValue>>;

// A name read as a path through a value. The whole name is tried first as one part, then each dotted split reads its head
// As a part and its tail as a path through that. A tail of `length` reads the length of a list or a text, and zero for any
// Other value, as SurveyJS reads it
export const readSurveyLogicPath = (container: SurveyLogicValue, name: string): SurveyLogicValue =>
  readMemoizedSurveyLogicPath(container, name, new Map());

const readMemoizedSurveyLogicPath = (container: SurveyLogicValue, name: string, memo: PathMemo): SurveyLogicValue => {
  const namesRead = memo.get(container) ?? new Map<string, SurveyLogicValue>();
  memo.set(container, namesRead);
  if (namesRead.has(name)) return namesRead.get(name);

  const value = readSurveyLogicPathUncached(container, name, memo);
  namesRead.set(name, value);
  return value;
};

const readSurveyLogicPathUncached = (container: SurveyLogicValue, name: string, memo: PathMemo): SurveyLogicValue => {
  const whole = readSurveyLogicPart(container, name);
  if (whole !== undefined) return whole;

  for (
    let separatorIndex = name.indexOf(".");
    separatorIndex !== -1;
    separatorIndex = name.indexOf(".", separatorIndex + 1)
  ) {
    const head = readSurveyLogicPart(container, name.slice(0, separatorIndex));
    const tail = name.slice(separatorIndex + 1);
    const value = readMemoizedSurveyLogicPath(head, tail, memo);
    if (value !== undefined) return value;
    if (tail === "length") return readSurveyLogicLength(head);
  }

  return undefined;
};

const readSurveyLogicLength = (value: SurveyLogicValue): number =>
  Array.isArray(value) || typeof value === "string" ? value.length : 0;
