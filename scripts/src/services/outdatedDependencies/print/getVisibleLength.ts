// Strips ANSI color escape sequences so colored cells measure by their printable width.
const ANSI_REGEX = new RegExp(`${String.fromCodePoint(27)}\\[[\\d;]+m`, "gu");

export const getVisibleLength = (text: string): number => text.replace(ANSI_REGEX, "").length;
