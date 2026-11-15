// The comparison SQLite makes on text under NOCASE, which the server pages by: ASCII letters fold to lower case, and the
// Folded text is compared byte by byte. JavaScript compares code units, and the two agree on every name short of a
// Supplementary character against one in U+E000 to U+FFFF
export const foldAsciiCase = (text: string) => text.replaceAll(/[A-Z]/gu, (letter) => letter.toLowerCase());
