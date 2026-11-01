import type { PanzoomAxis } from "#src/models/panzoom/PanzoomAxis";

import { PanzoomContain } from "#src/models/panzoom/PanzoomContain";

// The leading and trailing pans put the element's edges on its parent's edges
// Inside takes the leading pan as the lower bound and outside the trailing one, so an element larger than the area it
// Is contained in resolves to the lower bound
export const constrainPanzoomAxis = (
  value: number,
  axis: PanzoomAxis,
  scale: number,
  contain?: PanzoomContain,
): number => {
  if (!contain) return value;

  const halfLength = axis.length / 2;
  const leadingPan = (axis.parentStart - axis.center) / scale + halfLength;
  const trailingPan = (axis.parentStart + axis.parentLength - axis.center) / scale - halfLength;
  const isInside = contain === PanzoomContain.Inside;
  const lowerBound = isInside ? leadingPan : trailingPan;
  const upperBound = isInside ? trailingPan : leadingPan;
  return Math.max(Math.min(value, upperBound), lowerBound);
};
