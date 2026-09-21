const WHITESPACE_RUN_REGEX = /\s+/gu;

// A line as it is read: every run of whitespace one space, none at either end
export const collapseWhitespace = (text: string): string => text.replaceAll(WHITESPACE_RUN_REGEX, " ").trim();
