// The directions a Shortcut Wheel lays its entries out in, one entry to each: eight or four
export const ShortcutWheelDirectionCount = { Four: 4, Eight: 8 } as const;
export type ShortcutWheelDirectionCount =
  (typeof ShortcutWheelDirectionCount)[keyof typeof ShortcutWheelDirectionCount];
