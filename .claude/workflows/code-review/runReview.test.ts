import { readFile } from "node:fs/promises";
import { describe } from "vitest";

import type { AgentCall } from "./models/AgentCall";
import type { AgentOptions } from "./models/AgentOptions";
import type { AgentStub } from "./models/AgentStub";
import type { AsyncFunctionConstructor } from "./models/AsyncFunctionConstructor";
import type { RunResult } from "./models/RunResult";

import { SCRIPT_PATH } from "./constants.test";

// Relative imports: `.claude/` sits outside every workspace package, so none of the repo's path aliases resolve
// Here — the same exception `packages/configuration` carries.
const AsyncFunction: AsyncFunctionConstructor = Object.getPrototypeOf(async () => {})
  .constructor as AsyncFunctionConstructor;
/** The harness's `parallel()`: run every thunk at once and hand back all their results. */
const parallel = (thunks: (() => Promise<unknown>)[]): Promise<unknown[]> =>
  Promise.all(thunks.map((thunk) => thunk()));

/**
 * Drives one whole run of the real script against stubbed agents, and hands back everything a test can assert
 * on: the returned report, the logs, and every agent call the run made.
 */
export const runReview = async (args: string, agentStub: AgentStub): Promise<RunResult> => {
  const source = await readFile(SCRIPT_PATH, "utf8");
  // `export` is the one thing an async function body cannot carry; the harness strips it the same way.
  const body = source.replace(/^export const meta/mu, "const meta");
  const logs: string[] = [];
  const calls: AgentCall[] = [];
  const run = new AsyncFunction("args", "log", "agent", "parallel", "phase", "pipeline", "budget", "workflow", body);
  const agent = (prompt: string, options: AgentOptions = {}) => {
    calls.push({ label: options.label ?? "", options, prompt });
    return Promise.resolve(agentStub(prompt, options));
  };
  const result = await run(
    args,
    (message: string) => logs.push(message),
    agent,
    parallel,
    () => undefined,
    undefined,
    { total: null },
    undefined,
  );
  return { calls, logs, result };
};

describe.todo("runReview");
