// A command's stdout ends in a newline, so a plain split hands back a trailing empty entry that every reader
// Would otherwise have to filter for itself.
export const getNonEmptyLines = (output: string): string[] => output.split(/\r?\n/u).filter(Boolean);
