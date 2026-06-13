import type { ColorPalette } from "@/checkDependencies/models/ColorPalette";

// ANSI Select Graphic Rendition escape sequences. `escape` is the ESC control character (U+001B);
// 39 resets the foreground color back to the default.
const escape = String.fromCodePoint(27);
const reset = `${escape}[39m`;
const wrap = (code: number, text: string) => `${escape}[${code}m${text}${reset}`;

export const createColor = (isColorEnabled: boolean): ColorPalette => ({
  cyan: (text) => (isColorEnabled ? wrap(36, text) : text),
  green: (text) => (isColorEnabled ? wrap(32, text) : text),
  red: (text) => (isColorEnabled ? wrap(31, text) : text),
  yellow: (text) => (isColorEnabled ? wrap(33, text) : text),
});
