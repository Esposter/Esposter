import type { SvgPathCommand } from "#src/models/genshinParity/shared/SvgPathCommand";

export interface SvgPathSegment {
  command: SvgPathCommand;
  // Absolute coordinates as integers in the path's scale, with an arc's two flags as 0 or 1 unscaled
  values: number[];
}
