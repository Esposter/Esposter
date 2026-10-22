import { REVIEW_LINE_CHARACTER_LIMIT } from "#src/services/review/constants";

// Whether a file's diff holds a line no reviewer can read as text, a minified file's or embedded data's
export const checkIsUnreadableDiff = (diff: string): boolean =>
  diff.split("\n").some((line) => line.length > REVIEW_LINE_CHARACTER_LIMIT);
