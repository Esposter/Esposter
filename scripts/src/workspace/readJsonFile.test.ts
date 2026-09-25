import { parseMachineJson } from "#src/services/shared/parseMachineJson";
import { readFileSync } from "node:fs";
import { describe } from "vitest";

// A repo document — a manifest, a tsconfig, a linter's config — read for the fields a suite asserts on
// oxlint-disable-next-line typescript/no-unnecessary-type-parameters -- the caller names the type the parsed document holds
export const readJsonFile = <TValue = Record<string, unknown>>(path: string): TValue =>
  parseMachineJson<TValue>(readFileSync(path, "utf8"));

describe.todo("readJsonFile");
