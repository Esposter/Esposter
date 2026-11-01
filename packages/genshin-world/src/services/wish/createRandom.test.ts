import { describe } from "vitest";

// A random source that answers each of its values in turn, then zero once they run out
export const createRandom = (values: number[]): (() => number) => {
  let index = 0;
  return () => values[index++] ?? 0;
};

describe.todo("createRandom");
