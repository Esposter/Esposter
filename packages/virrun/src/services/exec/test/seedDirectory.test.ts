import { mkdirSync } from "node:fs";
import { describe } from "vitest";
// Seeds a directory (created recursively) and returns its path — the shared atom behind every prune/reap test's
// Directory fixture (a published snapshot/prepare/temp entry the code under test keeps or removes).
export const seedDirectory = (path: string): string => {
  mkdirSync(path, { recursive: true });
  return path;
};

describe.todo("seedDirectory");
