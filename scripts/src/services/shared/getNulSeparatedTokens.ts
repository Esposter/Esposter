// The reading for any git listing asked for with `-z`: every field NUL-terminated, so the last token is followed by
// A separator too and a plain split hands back a trailing empty entry — the `-z` counterpart of `getNonEmptyLines`
export const getNulSeparatedTokens = (output: string): string[] => output.split("\0").filter((token) => token !== "");
