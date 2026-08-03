import { describe } from "vitest";

import type { RunResult } from "./models/RunResult";

/** The prompt of the first agent whose label starts with `label`, or `""` when the run never spawned one. */
export const getPrompt = (run: RunResult, label: string) =>
  run.calls.find((call) => call.label.startsWith(label))?.prompt ?? "";

describe.todo("getPrompt");
