// A row title or a table label as it is compared exactly: case aside, and each run of whitespace read as one space
export const toExactTitle = (text: string): string => text.replaceAll(/\s+/gu, " ").trim().toLowerCase();
