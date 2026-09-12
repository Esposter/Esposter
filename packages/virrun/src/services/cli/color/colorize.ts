import type { Color } from "#src/models/cli/Color";

import { checkIsColorEnabled } from "#src/services/cli/color/checkIsColorEnabled";
import { ColorSgrMap } from "#src/services/cli/color/ColorSgrMap";
// Wraps text in the Color's ANSI SGR pair, but only when checkIsColorEnabled() — otherwise a passthrough, so the same call
// Is a no-op in a pipe, under NO_COLOR, or inside vitest (which is why the format-function tests still assert plain
// Strings). Nest calls to combine styles: colorize(colorize(text, Color.Cyan), Color.Bold).
export const colorize = (text: string, color: Color): string => {
  if (!checkIsColorEnabled()) return text;
  const [open, close] = ColorSgrMap[color];
  // oxlint-disable-next-line unicorn/no-hex-escape -- \x1b is the conventional, readable spelling of the ANSI ESC
  return `\x1B[${open}m${text}\x1B[${close}m`;
};
