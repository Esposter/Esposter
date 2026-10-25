import type { SvgPathSegment } from "#src/models/genshinParity/shared/SvgPathSegment";
import type { Token } from "#src/models/genshinParity/shared/Token";

import { SvgPathCommand } from "#src/models/genshinParity/shared/SvgPathCommand";
import { SvgPathTokenType } from "#src/models/genshinParity/shared/SvgPathTokenType";
import { toNumber } from "#src/services/genshinParity/shared/toNumber";
import { InvalidOperationError, Operation } from "@esposter/shared";

// The relative letter and operands of one segment from the current point it starts at, a horizontal or vertical line
// Where its run is along an axis, and an arc's flags kept as written
export const toRelative = (
  segment: SvgPathSegment,
  scale: number,
  cursorX: number,
  cursorY: number,
): [string, Token[]] => {
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
