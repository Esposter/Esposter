export const MAX_STYLE_VALUE_LENGTH = 512;
// A value may not hold "<", so it can never close a style element, nor "{" or "}", so it can never leave its rule. A
// Backslash could continue a string past its line and a comment opener could swallow the rules after it
export const STYLE_VALUE_REGEX = /^(?!.*\/\*)[^\n\r<\\{}]+$/u;
export const PAGE_TOKEN_NAME_REGEX = /^[a-z][\da-z-]*$/u;
export const MAX_PAGE_TOKEN_NAME_LENGTH = 64;
