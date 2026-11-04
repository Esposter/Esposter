import type { SurveyLogicPathMemo } from "#src/models/SurveyLogicPathMemo";
import type { SurveyLogicValue } from "#src/models/SurveyLogicValue";

import { readSurveyLogicPathUncached } from "#src/services/evaluator/readSurveyLogicPathUncached";

// Each (container, tail) pair is read once per call: a name's dotted splits reach the same tail through several heads, so
// Without it an unresolved name costs 2^dots reads. The memo is kept only for the one call, since a value may change between calls
export const readMemoizedSurveyLogicPath = (
  container: SurveyLogicValue,
  name: string,
  memo: SurveyLogicPathMemo,
): SurveyLogicValue => {
  const namesRead = memo.get(container) ?? new Map<string, SurveyLogicValue>();
  memo.set(container, namesRead);
  if (namesRead.has(name)) return namesRead.get(name);

  const value = readSurveyLogicPathUncached(container, name, (head, tail) =>
    readMemoizedSurveyLogicPath(head, tail, memo),
  );
  namesRead.set(name, value);
  return value;
};
