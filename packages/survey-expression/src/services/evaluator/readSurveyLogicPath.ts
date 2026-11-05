import type { SurveyLogicValue } from "#src/models/SurveyLogicValue";

import { readMemoizedSurveyLogicPath } from "#src/services/evaluator/readMemoizedSurveyLogicPath";
import { readSurveyLogicLength } from "#src/services/evaluator/readSurveyLogicLength";

const LENGTH_SUFFIX = ".length";

// A name read as a path through a value, through a memo that lasts for this one read. The splits are read by
// `readSurveyLogicPathUncached`. A name ending in `.length` that resolves to nothing reads the length of the path
// Before it, so a list or text under a dotted key is counted, and zero for any other value
export const readSurveyLogicPath = (container: SurveyLogicValue, name: string): SurveyLogicValue => {
  const value = readMemoizedSurveyLogicPath(container, name, new Map());
  if (value !== undefined || !name.endsWith(LENGTH_SUFFIX)) return value;

  return readSurveyLogicLength(readSurveyLogicPath(container, name.slice(0, -LENGTH_SUFFIX.length)));
};
