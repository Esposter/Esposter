const PREFIX_MATCH_REGEX = /(?!xmlns)^.*:/u;

export const stripPrefix = (string: string): string => string.replace(PREFIX_MATCH_REGEX, "");
