import { describe } from "vitest";

import type { Seam } from "./models/Seam";

/** One seam of a Scope agent's territory partition. */
export const createSeam = (name: string, pathPrefixes: string[], adjacentPathPrefixes?: string[]): Seam => ({
  adjacentPathPrefixes,
  name,
  pathPrefixes,
  summary: `${name} does things`,
});

describe.todo("createSeam");
