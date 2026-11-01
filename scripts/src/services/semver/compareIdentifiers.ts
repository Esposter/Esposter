import { compareNumericIdentifiers } from "#src/services/semver/compareNumericIdentifiers";
import { compareText } from "#src/services/semver/compareText";

const NUMERIC_IDENTIFIER_REGEX = /^\d+$/u;

// A numeric identifier sorts below an alphanumeric one, and two of either kind compare by their own rule
export const compareIdentifiers = (first: string, second: string): number => {
  const isFirstNumeric = NUMERIC_IDENTIFIER_REGEX.test(first);
  const isSecondNumeric = NUMERIC_IDENTIFIER_REGEX.test(second);
  if (isFirstNumeric && isSecondNumeric) return compareNumericIdentifiers(first, second);
  else if (isFirstNumeric) return -1;
  else if (isSecondNumeric) return 1;
  else return compareText(first, second);
};
