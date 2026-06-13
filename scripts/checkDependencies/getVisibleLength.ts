// Matches ANSI SGR escape sequences (ESC `[` … `m`) so colored cells measure by their printable width.
const ansiPattern = new RegExp(`${String.fromCodePoint(27)}\\[[\\d;]+m`, "gu");

export const getVisibleLength = (text: string): number => text.replace(ansiPattern, "").length;
