export const fade = (fraction: number): number =>
  fraction * fraction * fraction * (fraction * (fraction * 6 - 15) + 10);
