import type { SurveyLogicContext } from "#src/models/SurveyLogicContext";
import type { SurveyLogicValue } from "#src/models/SurveyLogicValue";

import { getOwnValue } from "#src/services/shared/getOwnValue";

// A name reads the answer under its exact key first.
// Failing that, its first part names a scope that a dynamic panel or row adds, and its rest names the key within it.
// Any other dotted name is empty
export const readSurveyLogicReference = (name: string, context: SurveyLogicContext): SurveyLogicValue => {
  const answer = getOwnValue(context.values, name);
  if (answer !== undefined) return answer;

  const separatorIndex = name.indexOf(".");
  if (separatorIndex === -1) return undefined;

  const scope = getOwnValue(context.scopes, name.slice(0, separatorIndex));
  return scope === undefined ? undefined : getOwnValue(scope, name.slice(separatorIndex + 1));
};
