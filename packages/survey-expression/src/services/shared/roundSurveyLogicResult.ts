import { MAX_DECIMAL_PLACES } from "#src/services/constants";

// A sum or product is rounded to the digits its operands carry, which removes the float noise of the binary result.
// `toFixed` takes at most the digits a number may carry, so a longer count is cut to that
export const roundSurveyLogicResult = (result: number, digits: number): number =>
  digits > 0 ? Number(result.toFixed(Math.min(digits, MAX_DECIMAL_PLACES))) : result;
