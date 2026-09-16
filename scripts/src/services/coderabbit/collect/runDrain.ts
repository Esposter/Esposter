import type { DrainRun } from "#src/models/coderabbit/collect/DrainRun";

import { CLAUDE_CODE_PACKAGE, DRAIN_MODEL } from "#src/services/coderabbit/collect/constants";
import { getDrainEventLine } from "#src/services/coderabbit/collect/getDrainEventLine";
import { getDrainLimitResetMs } from "#src/services/coderabbit/collect/getDrainLimitResetMs";
import { PNPM_ARGS, PNPM_FILE } from "#src/services/shared/constants";
import { spawn } from "node:child_process";
import { once } from "node:events";
import { createInterface } from "node:readline";

// Claude Code headless, the prompt on stdin, permission prompts skipped: the checkout is ephemeral and holds
// One credential scoped to this repository. The prompt carries CodeRabbit's finding text verbatim — untrusted
// Input steering a session that skips its prompts — so every secret-shaped variable is dropped from the child's
// Environment (a fixed denylist only protects what it already named) and `gh` authenticates the parent alone.
// The one exemption authenticates the `claude` invocation itself.
const EXEMPT_SECRET_VARIABLES = new Set(["CLAUDE_CODE_OAUTH_TOKEN"]);

const SECRET_VARIABLE_PATTERN = /credential|key|password|secret|token/iu;

// Stdout is streamed rather than inherited: each event is logged as it lands, and the sentence Claude Code
// Prints on its way out — parsed off its own lines, never the model's narration — is what separates a drain
// That failed from one that never started
export const runDrain = async (prompt: string, cwd: string): Promise<DrainRun> => {
  const environment = Object.fromEntries(
    Object.keys(process.env)
      .filter((key) => EXEMPT_SECRET_VARIABLES.has(key) || !SECRET_VARIABLE_PATTERN.test(key))
      .map((key) => [key, process.env[key]]),
  );
  const child = spawn(
    PNPM_FILE,
    [
      ...PNPM_ARGS,
      "dlx",
      CLAUDE_CODE_PACKAGE,
      "-p",
      "--model",
      DRAIN_MODEL,
      "--dangerously-skip-permissions",
      "--output-format",
      "stream-json",
      "--verbose",
    ],
    { cwd, env: environment, stdio: ["pipe", "pipe", "inherit"] },
  );
  // Registered before the read loop: `close` fires on the tick after stdout ends, before the loop resumes
  const closed = once(child, "close");
  // A refusal to start closes the pipe under the write; the exit status already says what happened
  child.stdin.on("error", console.error);
  child.stdin.end(prompt);
  const ownLines: string[] = [];
  for await (const line of createInterface({ input: child.stdout })) {
    const logLine = getDrainEventLine(line);
    if (logLine === undefined) continue;

    console.info(logLine.text);
    if (!logLine.isNarration) ownLines.push(logLine.text);
  }
  await closed;
  // A limit is a refusal to start, read only off a non-zero exit: the refusal's own result frame states `success`,
  // And reading a clean exit's output for the sentence would discard work over text the drain merely echoed
  const isDrained = child.exitCode === 0;
  return {
    isDrained,
    limitResetAtMs: isDrained ? undefined : getDrainLimitResetMs(ownLines.join("\n"), Date.now()),
  };
};
