import { describe } from "vitest";

export const getText = (unit: string, byteCount: number): string =>
  unit.repeat(Math.ceil(byteCount / unit.length)).slice(0, byteCount);

describe.todo("getText");
