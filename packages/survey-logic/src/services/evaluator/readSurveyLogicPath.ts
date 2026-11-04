import type { SurveyLogicValue } from "#src/models/SurveyLogicValue";

import { readMemoizedSurveyLogicPath } from "#src/services/evaluator/readMemoizedSurveyLogicPath";

// A name read as a path through a value. The whole name is tried first as one part, then each dotted split reads its head
// As a part and its tail as a path through that. A tail of `length` reads the length of a list or a text, and zero for any
// Other value
export const readSurveyLogicPath = (container: SurveyLogicValue, name: string): SurveyLogicValue =>
  readMemoizedSurveyLogicPath(container, name, new Map());
