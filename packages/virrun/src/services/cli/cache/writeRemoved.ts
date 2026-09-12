import { Color } from "#src/models/cli/Color";
import { colorize } from "#src/services/cli/color/colorize";
import { formatVirrunLine } from "#src/services/cli/format/formatVirrunLine";
// Each removal is announced as it lands, the path reddened — destruction outranks the palette's plain path=Blue rule.
export const writeRemoved = (path: string): void => {
  process.stderr.write(`${formatVirrunLine(`removed ${colorize(path, Color.Red)}`)}\n`);
};
