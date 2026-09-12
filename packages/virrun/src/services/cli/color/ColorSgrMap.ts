import { Color } from "#src/models/cli/Color";
// The SGR open/close code pair per Color. Foreground colors reset with 39, bold/dim with 22, so a nested colorize
// Never clobbers the outer style's reset.
export const ColorSgrMap: Record<Color, readonly [number, number]> = {
  // 94 = bright blue, not 34 (standard/dark blue) — dark blue is near-invisible on a dark terminal. Bright blue reads
  // Like the vivid filename color rolldown prints when a build finishes, while staying distinct from the cyan tag.
  [Color.Blue]: [94, 39],
  [Color.Bold]: [1, 22],
  [Color.Cyan]: [36, 39],
  [Color.Dim]: [2, 22],
  [Color.Green]: [32, 39],
  [Color.Red]: [31, 39],
  [Color.Yellow]: [33, 39],
};
