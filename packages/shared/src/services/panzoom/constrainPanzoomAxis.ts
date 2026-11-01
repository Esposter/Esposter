import type { PanzoomAxis } from "#src/models/panzoom/PanzoomAxis";

import { PanzoomContain } from "#src/models/panzoom/PanzoomContain";
import { checkIsContainableLength } from "#src/services/panzoom/checkIsContainableLength";

// The leading and trailing pans put the element's edges on its parent's edges
// Inside takes the leading pan as the lower bound and outside the trailing one, so an element larger than the area it
// Is contained in resolves to the lower bound. Automatic is inside on an axis the scaled element fits, and outside on one it overflows.
// A parent side that is zero or non-finite contains nothing on its axis, so the value stands
export const constrainPanzoomAxis = (
  value: number,
  axis: PanzoomAxis,
  scale: number,
  contain?: PanzoomContain,
): number => {
  if (!contain || !checkIsContainableLength(axis.parentLength)) return value;

  const halfLength = axis.length / 2;
  const leadingPan = (axis.parentStart - axis.center) / scale + halfLength;
  const trailingPan = (axis.parentStart + axis.parentLength - axis.center) / scale - halfLength;
  const isFitting = axis.length * scale <= axis.parentLength;
  const isInside = contain === PanzoomContain.Inside || (contain === PanzoomContain.Automatic && isFitting);
  const lowerBound = isInside ? leadingPan : trailingPan;
  const upperBound = isInside ? trailingPan : leadingPan;
  return Math.max(Math.min(value, upperBound), lowerBound);
};
