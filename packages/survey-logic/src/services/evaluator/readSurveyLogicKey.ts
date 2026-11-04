import type { SurveyLogicValue } from "#src/models/SurveyLogicValue";

import { getOwnValue } from "#src/services/shared/getOwnValue";

const DIGITS_ONLY_REGEX = /^\d+$/u;

// A list is read by its digit keys and a record by its own keys. Any other value holds no key
export const readSurveyLogicKey = (container: SurveyLogicValue, key: string): SurveyLogicValue => {
  if (Array.isArray(container)) return DIGITS_ONLY_REGEX.test(key) ? container.at(Number(key)) : undefined;
  if (typeof container === "object") return getOwnValue(container, key);

  return undefined;
};
