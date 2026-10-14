import type { SvgPathSegment } from "#src/models/genshinParity/shared/SvgPathSegment";

export interface SvgPath {
  scale: number;
  segments: SvgPathSegment[];
}
