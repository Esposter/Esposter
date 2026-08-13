import { describe } from "vitest";

import type { RunResult } from "./models/RunResult";

/**
 * The prompt of the first agent whose label starts with `label`. Throws when the run spawned none: every caller
 * asserts about an agent the run is supposed to have, and a `""` fallback would pass every `not.toContain` check
 * on exactly the regression that stopped spawning it.
 */
export const getPrompt = (run: RunResult, label: string): string => {
  const call = run.calls.find((entry) => entry.label.startsWith(label));

  if (!call) throw new Error(`the run spawned no agent labelled "${label}"`);

  return call.prompt;
};

describe.todo("getPrompt");
