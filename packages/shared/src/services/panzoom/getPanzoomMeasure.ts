import type { PanzoomElement } from "#src/models/panzoom/PanzoomElement";
import type { PanzoomMeasure } from "#src/models/panzoom/PanzoomMeasure";
import type { PanzoomState } from "#src/models/panzoom/PanzoomState";

// One read of the element's and the parent's rectangles. The layout centre is the rectangle's centre less the scaled pan,
// The unscaled size is the rectangle over the scale, and the parent's content box is its rectangle less its border and padding
export const getPanzoomMeasure = (
  element: PanzoomElement,
  parent: PanzoomElement,
  state: PanzoomState,
): PanzoomMeasure => {
  const rectangle = element.getBoundingClientRect();
  const parentRectangle = parent.getBoundingClientRect();
  const parentStyle = getComputedStyle(parent);
  // oxlint-disable-next-line unicorn/prefer-number-coercion -- computed styles are px-suffixed ("8px"), Number() would be NaN
  const insetLeft = Number.parseFloat(parentStyle.borderLeftWidth) + Number.parseFloat(parentStyle.paddingLeft);
  // oxlint-disable-next-line unicorn/prefer-number-coercion -- computed styles are px-suffixed ("8px"), Number() would be NaN
  const insetTop = Number.parseFloat(parentStyle.borderTopWidth) + Number.parseFloat(parentStyle.paddingTop);
  // oxlint-disable-next-line unicorn/prefer-number-coercion -- computed styles are px-suffixed ("8px"), Number() would be NaN
  const insetRight = Number.parseFloat(parentStyle.borderRightWidth) + Number.parseFloat(parentStyle.paddingRight);
  // oxlint-disable-next-line unicorn/prefer-number-coercion -- computed styles are px-suffixed ("8px"), Number() would be NaN
  const insetBottom = Number.parseFloat(parentStyle.borderBottomWidth) + Number.parseFloat(parentStyle.paddingBottom);

  return {
    center: {
      x: rectangle.left + rectangle.width / 2 - state.scale * state.x,
      y: rectangle.top + rectangle.height / 2 - state.scale * state.y,
    },
    parent: {
      height: parentRectangle.height - insetTop - insetBottom,
      left: parentRectangle.left + insetLeft,
      top: parentRectangle.top + insetTop,
      width: parentRectangle.width - insetLeft - insetRight,
    },
    size: { height: rectangle.height / state.scale, width: rectangle.width / state.scale },
  };
};
