import { DECIMAL_MARK_OPERATOR_FOLLOWERS } from "#src/services/parser/token/constants";

// A decimal mark that mathjs reads as a dot of its own, unless a division, product or power follows it
export const checkIsDecimalMark = (character: string, nextCharacter: string): boolean =>
  character === "." && !DECIMAL_MARK_OPERATOR_FOLLOWERS.has(nextCharacter);
