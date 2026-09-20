import { parseMachineJson } from "#src/services/shared/parseMachineJson";
import { readFileSync } from "node:fs";
import { describe } from "vitest";

// A repo document — a manifest, a tsconfig, a linter's config — read for the fields a suite asserts on
export const readJsonFile = (path: string): Record<string, unknown> =>
  parseMachineJson<Record<string, unknown>>(readFileSync(path, "utf8"));

describe.todo("readJsonFile");
