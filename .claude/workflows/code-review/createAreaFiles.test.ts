import { describe } from "vitest";

/** An area file set big enough to clear the 25-file seam threshold, or large enough to trip the 120-file cap. */
export const createAreaFiles = (count = 30): string[] =>
  Array.from({ length: count }, (_, index) => `cache/f${index}.ts`);

describe.todo("createAreaFiles");
