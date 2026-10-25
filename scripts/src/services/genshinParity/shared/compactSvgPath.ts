import type { Token } from "#src/models/genshinParity/shared/Token";

import { SvgPathCommand } from "#src/models/genshinParity/shared/SvgPathCommand";
import { SvgPathTokenType } from "#src/models/genshinParity/shared/SvgPathTokenType";
import { checkImplicit } from "#src/services/genshinParity/shared/checkImplicit";
import { parseSvgPath } from "#src/services/genshinParity/shared/parseSvgPath";
import { renderTokens } from "#src/services/genshinParity/shared/renderTokens";
import { toRelative } from "#src/services/genshinParity/shared/toRelative";

// The same geometry in SVG's shortest form: relative commands, implicit letters, and a line along an axis written as
// One operand. Only the opening moveto stays absolute, so paths joined into one `d` keep their places: a relative one
// Would start from wherever the path before it closed
export const compactSvgPath = (d: string): string => {
  const { scale, segments } = parseSvgPath(d);
  const tokens: Token[] = [];
  let cursorX = 0;
  let cursorY = 0;
  let startX = 0;
  let startY = 0;
  let previousLetter = "";
  for (const segment of segments) {
    const [relativeLetter, operands] = toRelative(segment, scale, cursorX, cursorY);
    // From the origin a relative pair is the absolute one, so the opening moveto changes its letter alone
    const letter = tokens.length === 0 && relativeLetter === "m" ? "M" : relativeLetter;
    if (!checkImplicit(previousLetter, letter)) tokens.push({ text: letter, type: SvgPathTokenType.Letter });
    tokens.push(...operands);
    previousLetter = letter;
    if (segment.command === SvgPathCommand.Close) {
      cursorX = startX;
      cursorY = startY;
    } else {
      const [endX = cursorX, endY = cursorY] = segment.values.slice(-2);
      cursorX = endX;
      cursorY = endY;
      if (segment.command === SvgPathCommand.Move) {
        startX = cursorX;
        startY = cursorY;
      }
    }
  }
  return renderTokens(tokens);
};
