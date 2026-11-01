const COMMENT_REGEX = /\/\*[\s\S]*?\*\//gu;

// A stylesheet with its comments blanked rather than dropped, so a line stays the line it was written on
export const blankCssComments = (css: string): string =>
  css.replaceAll(COMMENT_REGEX, (comment) => comment.replaceAll(/[^\n]/gu, " "));
