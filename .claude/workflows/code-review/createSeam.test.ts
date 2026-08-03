import { describe } from "vitest";

/** One seam of a Scope agent's territory partition. */
export const createSeam = (name: string, pathPrefixes: string[], adjacentPathPrefixes?: string[]) => ({
  adjacentPathPrefixes,
  name,
  pathPrefixes,
  summary: name + " does things",
});

describe.todo("createSeam");
