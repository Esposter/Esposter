import type { SurveyLogicValue } from "#src/models/SurveyLogicValue";

import { readMemoizedSurveyLogicPath } from "#src/services/evaluator/readMemoizedSurveyLogicPath";

// A name read as a path through a value, through a memo that lasts for this one read. The splits are read by
// `readSurveyLogicPathUncached`
export const readSurveyLogicPath = (container: SurveyLogicValue, name: string): SurveyLogicValue =>
  readMemoizedSurveyLogicPath(container, name, new Map());
