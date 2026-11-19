import { compareText } from "@esposter/shared";

// Numeric identifiers never carry a leading zero, so a longer one is the larger and equal lengths compare as text
export const compareNumericIdentifiers = (first: string, second: string): number =>
  first.length - second.length || compareText(first, second);
