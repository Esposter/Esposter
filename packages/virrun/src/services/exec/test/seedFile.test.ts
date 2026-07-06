import { mkdirSync, writeFileSync } from "node:fs";
import { dirname } from "node:path";
import { describe } from "vitest";
// Seeds an empty file (parent directories created) and returns its path — the file-shaped twin of seedDirectory for
// Fixtures the code under test keeps or removes (leases, staged mirror temps, captured upper contents).
export const seedFile = (path: string): string => {
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, "");
  return path;
};

describe.todo("seedFile");
