import { MenuDirection } from "#src/models/menu/MenuDirection";

// The index of the control nearest the one at `fromIndex` that lies in a direction, measured between their centres: how
// Far it lies that way, with its sideways offset counted twice, so a control in line beats a nearer one off it. It
// Is undefined when no control lies that way
export const findMenuFocusTarget = (
  rectangles: readonly Pick<DOMRect, "bottom" | "left" | "right" | "top">[],
  fromIndex: number,
  direction: MenuDirection,
): number | undefined => {
  const from = rectangles[fromIndex];
  if (!from) return undefined;
  const isHorizontal = [MenuDirection.Left, MenuDirection.Right].includes(direction);
  const sign = [MenuDirection.Down, MenuDirection.Right].includes(direction) ? 1 : -1;
  let targetIndex: number | undefined;
  let targetScore = Infinity;
  for (const [index, rectangle] of rectangles.entries()) {
    if (index === fromIndex) continue;
    const offsetX = (rectangle.left + rectangle.right - from.left - from.right) / 2;
    const offsetY = (rectangle.top + rectangle.bottom - from.top - from.bottom) / 2;
    const along = sign * (isHorizontal ? offsetX : offsetY);
    if (along <= 0) continue;
    const score = along + 2 * Math.abs(isHorizontal ? offsetY : offsetX);
    if (score < targetScore) {
      targetScore = score;
      targetIndex = index;
    }
  }
  return targetIndex;
};
