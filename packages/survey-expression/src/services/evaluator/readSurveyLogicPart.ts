import type { SurveyLogicValue } from "#src/models/SurveyLogicValue";

import { readSurveyLogicKey } from "#src/services/evaluator/readSurveyLogicKey";

// A key holds no bracket, so a bracket after it is the index that follows
const PART_REGEX = /^(?<key>[^[]*)(?:\[(?<index>\d+)\])?$/u;

// The value a part of a name reads: a key of the value before it, then an item of the list under that key when the part
// Ends in an index. A list reads its items by a digit key as well, as `{list.0}` does
export const readSurveyLogicPart = (container: SurveyLogicValue, part: string): SurveyLogicValue => {
  const match = PART_REGEX.exec(part);
  if (match === null) return undefined;

  const { index, key = "" } = match.groups ?? {};
  const value = readSurveyLogicKey(container, key);
  if (index === undefined) return value;

  return Array.isArray(value) ? value.at(Number(index)) : undefined;
};
