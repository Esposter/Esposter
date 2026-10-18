import type { ShortcutWheelDirectionCount } from "#src/models/shortcutWheel/ShortcutWheelDirectionCount";

// The entry the pointer points toward, counted clockwise from the top of the wheel as index 0. A pointer at the centre
// Points nowhere, so it picks no entry
export const getShortcutWheelDirectionIndex = (
  x: number,
  y: number,
  directionCount: ShortcutWheelDirectionCount,
): number | undefined => {
  if (x === 0 && y === 0) return undefined;

  // Screen y grows downward, so the top is negative y, and the angle runs clockwise from it
  const angle = (Math.atan2(x, -y) + 2 * Math.PI) % (2 * Math.PI);
  const sectorAngle = (2 * Math.PI) / directionCount;
  return Math.round(angle / sectorAngle) % directionCount;
};
