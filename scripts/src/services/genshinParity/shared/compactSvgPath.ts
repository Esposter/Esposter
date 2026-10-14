import type { SvgPathSegment } from "#src/models/genshinParity/shared/SvgPathSegment";

import { SvgPathCommand } from "#src/models/genshinParity/shared/SvgPathCommand";
import { SvgPathTokenType } from "#src/models/genshinParity/shared/SvgPathTokenType";
import { parseSvgPath } from "#src/services/genshinParity/shared/parseSvgPath";
import { InvalidOperationError, Operation } from "@esposter/shared";

interface Token {
  text: string;
  type: SvgPathTokenType;
}

// A number at the path's scale, with no leading zero and no trailing one
const formatNumber = (value: number, scale: number): string => {
  const sign = value < 0 ? "-" : "";
  const magnitude = Math.abs(value);
  const whole = Math.floor(magnitude / scale);
  const fraction = magnitude % scale;
  if (!fraction) return `${sign}${whole}`;
  const digits = String(fraction)
    .padStart(String(scale).length - 1, "0")
    .replace(/0+$/u, "");
  return `${sign}${whole || ""}.${digits}`;
};

const toNumber = (value: number, scale: number): Token => ({
  text: formatNumber(value, scale),
  type: SvgPathTokenType.Number,
});

// The relative letter and operands of one segment from the current point it starts at, a horizontal or vertical line
// Where its run is along an axis, and an arc's flags kept as written
const toRelative = (segment: SvgPathSegment, scale: number, cursorX: number, cursorY: number): [string, Token[]] => {
  const { command, values } = segment;
  switch (command) {
    case SvgPathCommand.Arc: {
      const [radiusX = 0, radiusY = 0, rotation = 0, largeArc = 0, sweep = 0, endX = 0, endY = 0] = values;
      return [
        "a",
        [
          toNumber(radiusX, scale),
          toNumber(radiusY, scale),
          toNumber(rotation, scale),
          { text: String(largeArc), type: SvgPathTokenType.Flag },
          { text: String(sweep), type: SvgPathTokenType.Flag },
          toNumber(endX - cursorX, scale),
          toNumber(endY - cursorY, scale),
        ],
      ];
    }
    case SvgPathCommand.Close:
      return ["z", []];
    case SvgPathCommand.Cubic:
    case SvgPathCommand.Move:
    case SvgPathCommand.Quadratic:
      return [
        command.toLowerCase(),
        values.map((value, index) => toNumber(value - (index % 2 ? cursorY : cursorX), scale)),
      ];
    case SvgPathCommand.Line: {
      const [endX = 0, endY = 0] = values;
      const deltaX = endX - cursorX;
      const deltaY = endY - cursorY;
      if (!deltaY) return ["h", [toNumber(deltaX, scale)]];
      if (!deltaX) return ["v", [toNumber(deltaY, scale)]];
      return ["l", [toNumber(deltaX, scale), toNumber(deltaY, scale)]];
    }
    default:
      throw new InvalidOperationError(Operation.Read, "path segment", "a command the codec does not write");
  }
};

// A space only where two numbers would otherwise read as one: a flag is always spaced, and a number that starts with a
// Minus sign or a point needs none after a number that has no point of its own
const needsSpace = (previous: Token, next: Token): boolean => {
  if (previous.type === SvgPathTokenType.Letter || next.type === SvgPathTokenType.Letter) return false;
  if (previous.type === SvgPathTokenType.Flag || next.type === SvgPathTokenType.Flag) return true;
  if (next.text.startsWith("-")) return false;
  return !next.text.startsWith(".") || !previous.text.includes(".");
};

const renderTokens = (tokens: Token[]): string => {
  let output = "";
  let previous: Token | undefined;
  for (const token of tokens) {
    if (previous && needsSpace(previous, token)) output += " ";
    output += token.text;
    previous = token;
  }
  return output;
};

// A repeated command's letter is left out, and so is a lineto after a moveto, which the moveto's own pairs imply
const checkImplicit = (previousLetter: string, letter: string): boolean =>
  letter !== "m" && letter !== "z" && (letter === previousLetter || (previousLetter === "m" && letter === "l"));

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
