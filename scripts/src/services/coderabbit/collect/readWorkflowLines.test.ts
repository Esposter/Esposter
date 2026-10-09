import { REPOSITORY_ROOT } from "#src/services/shared/constants";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe } from "vitest";

// A workflow file's lines, for the pins that hold a value it cannot import to the constant that owns it
export const readWorkflowLines = (name: string): string[] =>
  readFileSync(join(REPOSITORY_ROOT, ".github/workflows", name), "utf8").split(/\r?\n/u);

describe.todo("readWorkflowLines");
