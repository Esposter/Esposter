import { Color } from "@/models/cli/Color";
import { isColorEnabled } from "@/services/cli/isColorEnabled";
// The SGR open/close code pair per Color. Foreground colors reset with 39, bold/dim with 22, so a nested colorize
// Never clobbers the outer style's reset.
const COLOR_SGR_MAP = {
  // 94 = bright blue, not 34 (standard/dark blue) — dark blue is near-invisible on a dark terminal. Bright blue reads
  // Like the vivid filename color rolldown prints when a build finishes, while staying distinct from the cyan tag.
  [Color.Blue]: [94, 39],
  [Color.Bold]: [1, 22],
  [Color.Cyan]: [36, 39],
  [Color.Dim]: [2, 22],
  [Color.Green]: [32, 39],
  [Color.Red]: [31, 39],
  [Color.Yellow]: [33, 39],
} as const satisfies Record<Color, readonly [number, number]>;
// Wraps text in the Color's ANSI SGR pair, but only when isColorEnabled() — otherwise a passthrough, so the same call
// Is a no-op in a pipe, under NO_COLOR, or inside vitest (which is why the format-function tests still assert plain
// Strings). Nest calls to combine styles: colorize(colorize(text, Color.Cyan), Color.Bold).
export const colorize = (text: string, color: Color): string => {
  if (!isColorEnabled()) return text;
  const [open, close] = COLOR_SGR_MAP[color];
  // oxlint-disable-next-line unicorn/no-hex-escape -- \x1b is the conventional, readable spelling of the ANSI ESC
  return `\x1B[${open}m${text}\x1B[${close}m`;
};
