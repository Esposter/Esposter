export const getText = (unit: string, byteCount: number) =>
  unit.repeat(Math.ceil(byteCount / unit.length)).slice(0, byteCount);
