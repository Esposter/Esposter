import type { SvgPath } from "#src/models/genshinParity/shared/SvgPath";
import type { SvgPathSegment } from "#src/models/genshinParity/shared/SvgPathSegment";

import { SvgPathCommand } from "#src/models/genshinParity/shared/SvgPathCommand";
import { NUMBER_SOURCE } from "#src/services/genshinParity/shared/constants";
import { getScale } from "#src/services/genshinParity/shared/getScale";
import { InvalidOperationError, Operation } from "@esposter/shared";

const COMMAND_REGEX = /[A-Za-z]/u;
const FLAG_REGEX = /[01]/u;
const NUMBER_REGEX = new RegExp(NUMBER_SOURCE, "uy");
const SEPARATOR_REGEX = /[\s,]/u;

// Reads an SVG path's moveto, lineto, horizontal and vertical lines, quadratic and cubic curves, arcs and closes in
// Either case, and returns them absolute: a relative command's operands are added to the current point it starts from
export const parseSvgPath = (d: string, scale: number = getScale(d)): SvgPath => {
  const segments: SvgPathSegment[] = [];
  let index = 0;
  let command = "";
  let x = 0;
  let y = 0;
  let startX = 0;
  let startY = 0;

  const skipSeparators = () => {
    while (index < d.length && SEPARATOR_REGEX.test(d.charAt(index))) index++;
  };
  const checkIsEnd = () => {
    skipSeparators();
    return index >= d.length;
  };
  const readNumber = () => {
    skipSeparators();
    NUMBER_REGEX.lastIndex = index;
    const match = NUMBER_REGEX.exec(d);
    if (!match) throw new InvalidOperationError(Operation.Read, "path data", "a number where a command's operand is");
    index = NUMBER_REGEX.lastIndex;
    return Math.round(Number(match[0]) * scale);
  };
  const readFlag = () => {
    skipSeparators();
    const flag = d.charAt(index);
    if (!FLAG_REGEX.test(flag))
      throw new InvalidOperationError(Operation.Read, "path data", "an arc flag that is not 0 or 1");
    index++;
    return Number(flag);
  };
  // A point's operands are relative to the current point the segment starts from, so the point is read before it moves
  const readPoint = (relative: boolean): [number, number] => {
    const pointX = readNumber();
    const pointY = readNumber();
    return relative ? [x + pointX, y + pointY] : [pointX, pointY];
  };

  while (!checkIsEnd()) {
    if (COMMAND_REGEX.test(d.charAt(index))) {
      command = d.charAt(index);
      index++;
    } else if (!command) throw new InvalidOperationError(Operation.Read, "path data", "an operand before any command");

    const upper = command.toUpperCase();
    const relative = command !== upper;
    if (segments.length === 0 && upper !== SvgPathCommand.Move)
      throw new InvalidOperationError(Operation.Read, "path data", "a path that does not start with a moveto");
    if (upper === SvgPathCommand.Close) {
      segments.push({ command: SvgPathCommand.Close, values: [] });
      x = startX;
      y = startY;
      command = "";
      continue;
    }

    switch (upper) {
      case "H": {
        const pointX = readNumber();
        x = relative ? x + pointX : pointX;
        segments.push({ command: SvgPathCommand.Line, values: [x, y] });
        break;
      }
      case SvgPathCommand.Arc: {
        const radiusX = readNumber();
        const radiusY = readNumber();
        const rotation = readNumber();
        const largeArc = readFlag();
        const sweep = readFlag();
        const [endX, endY] = readPoint(relative);
        segments.push({
          command: SvgPathCommand.Arc,
          values: [radiusX, radiusY, rotation, largeArc, sweep, endX, endY],
        });
        x = endX;
        y = endY;
        break;
      }
      case SvgPathCommand.Cubic: {
        const [firstX, firstY] = readPoint(relative);
        const [secondX, secondY] = readPoint(relative);
        const [endX, endY] = readPoint(relative);
        segments.push({ command: SvgPathCommand.Cubic, values: [firstX, firstY, secondX, secondY, endX, endY] });
        x = endX;
        y = endY;
        break;
      }
      case SvgPathCommand.Line:
      case SvgPathCommand.Move: {
        const [endX, endY] = readPoint(relative);
        const kind = upper === SvgPathCommand.Move ? SvgPathCommand.Move : SvgPathCommand.Line;
        segments.push({ command: kind, values: [endX, endY] });
        x = endX;
        y = endY;
        if (kind === SvgPathCommand.Move) {
          startX = x;
          startY = y;
          // The operands after a moveto's first pair are linetos, so the command repeats as one
          command = relative ? "l" : "L";
        }
        break;
      }
      case SvgPathCommand.Quadratic: {
        const [controlX, controlY] = readPoint(relative);
        const [endX, endY] = readPoint(relative);
        segments.push({ command: SvgPathCommand.Quadratic, values: [controlX, controlY, endX, endY] });
        x = endX;
        y = endY;
        break;
      }
      case "V": {
        const pointY = readNumber();
        y = relative ? y + pointY : pointY;
        segments.push({ command: SvgPathCommand.Line, values: [x, y] });
        break;
      }
      default:
        throw new InvalidOperationError(Operation.Read, "path data", "a command outside M L H V Q C A Z");
    }
  }

  return { scale, segments };
};
