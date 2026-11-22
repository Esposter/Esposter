import { REPOSITORY_ROOT } from "#src/services/shared/constants";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe } from "vitest";

// A file's text, read by its path from the repository root
export const readRepositoryFile = (path: string): string => readFileSync(join(REPOSITORY_ROOT, path), "utf8");

describe.todo("readRepositoryFile");
