import type { SurveyLogicValue } from "#src/models/SurveyLogicValue";

import { toSurveyLogicTextNumber } from "#src/services/shared/toSurveyLogicTextNumber";

// SurveyJS's functions read a binary, octal or upper-case hexadecimal text by its digits with parseFloat, which stops at
// The zero of its prefix, so such a text reads as zero where a number is read
const PARSE_FLOAT_PREFIX_REGEX = /^0(?:[bo]|[BOX])/u;

// The number a function reads a value as, by SurveyJS's rules: a text reads as a number only when all of it is one, so
// `12abc` is not, while `1,5` is 1.5 and `0x1F` is 31. A list or a record is not a number, since a text cannot hold one whole
export const getSurveyNumber = (value: SurveyLogicValue): number => {
  if (typeof value === "number") return Number.isFinite(value) ? value : Number.NaN;
  if (typeof value !== "string") return Number.NaN;

  const number = toSurveyLogicTextNumber(value);
  return Number.isNaN(number) || !PARSE_FLOAT_PREFIX_REGEX.test(value.trim()) ? number : 0;
};
