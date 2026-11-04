import type { SurveyLogicContext } from "#src/models/SurveyLogicContext";
import type { SurveyLogicValue } from "#src/models/SurveyLogicValue";

import { readSurveyLogicPath } from "#src/services/evaluator/readSurveyLogicPath";
import { getOwnValue } from "#src/services/shared/getOwnValue";

// A name reads the answer under its exact key first. Failing that, its first part may name a scope the caller passes.
// The rest of the name is read inside that scope as a top-level name is read: its exact key, then its path.
// Any other name is a path through the answers, so a nested answer is read by its dotted keys, its indexes and its length
export const readSurveyLogicReference = (name: string, context: SurveyLogicContext): SurveyLogicValue => {
  const answer = getOwnValue(context.values, name);
  if (answer !== undefined) return answer;

  const separatorIndex = name.indexOf(".");
  const scope = separatorIndex === -1 ? undefined : getOwnValue(context.scopes, name.slice(0, separatorIndex));
  if (scope !== undefined) {
    const scopedName = name.slice(separatorIndex + 1);
    return getOwnValue(scope, scopedName) ?? readSurveyLogicPath(scope, scopedName);
  }

  return readSurveyLogicPath(context.values, name);
};
