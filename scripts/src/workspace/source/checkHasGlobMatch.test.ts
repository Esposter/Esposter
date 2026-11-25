import { glob } from "node:fs/promises";
import { describe } from "vitest";

// Whether a glob matches anything under `cwd` — the first entry answers it, so the walk stops there
export const checkHasGlobMatch = async (pattern: string | string[], cwd: string): Promise<boolean> => {
  for await (const _ of glob(pattern, { cwd })) return true;
  return false;
};

describe.todo("checkHasGlobMatch");
