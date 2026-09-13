import type { DrainRun } from "#src/models/coderabbit/collect/DrainRun";

import { CLAUDE_CODE_PACKAGE, DRAIN_MODEL, IS_PNPM_SHELL } from "#src/services/coderabbit/collect/constants";
import { getDrainEventLine } from "#src/services/coderabbit/collect/getDrainEventLine";
import { getDrainLimitResetMs } from "#src/services/coderabbit/collect/getDrainLimitResetMs";
import { REPOSITORY_ROOT } from "#src/services/shared/constants";
import { spawn } from "node:child_process";
import { once } from "node:events";
import { createInterface } from "node:readline";

// Claude Code headless, the prompt on stdin. Permission prompts are skipped because the checkout is ephemeral
// Or dedicated and holds one credential scoped to this repository, so the interactive model protects nothing
// Here and would stall the drain on its first `git commit`. A non-zero exit is the caller's signal that nothing
// It produced may be pushed.
//
// The prompt carries CodeRabbit's finding text verbatim, which is model-written prose about code anyone may have
// Contributed — untrusted input steering a session that skips its permission prompts. So the drain is given no
// Credential that can act on this repository: `GH_TOKEN` is dropped here, and the runner checks out with
// `persist-credentials: false` so the checkout's remote carries none either. `gh` authenticates the collector's
// Own pushes and replies from the environment of the parent process, which this child does not share.
const WITHHELD_VARIABLES = new Set(["GH_TOKEN", "GITHUB_TOKEN"]);

// The session is streamed, one event per line, and each is written to the log as it lands — so a run's log
// Shows which model answered, what the session is doing twenty minutes in, and what the session cost, rather
// Than the dlx install until it ends. Stdout is read rather than inherited for the same reason it always was:
// The sentence Claude Code prints on its way out is what separates a drain that failed from one that never
// Started, and it is parsed off the lines Claude Code spoke for itself — never off the model's narration.
export const runDrain = async (prompt: string): Promise<DrainRun> => {
  const environment = Object.fromEntries(
    Object.keys(process.env)
      .filter((key) => !WITHHELD_VARIABLES.has(key))
      .map((key) => [key, process.env[key]]),
  );
  const child = spawn(
    "pnpm",
    [
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
    { cwd: REPOSITORY_ROOT, env: environment, shell: IS_PNPM_SHELL, stdio: ["pipe", "pipe", "inherit"] },
  );
  // Registered before the output is read: `close` fires on the tick after stdout ends, which is before the read
  // Loop below resumes, so a listener added after the loop would wait for an event already emitted
  const closed = once(child, "close");
  // A child that exits before it has read the prompt — a refusal to start — closes the pipe under the write, and
  // The exit status already says what happened
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
  return { isDrained: child.exitCode === 0, limitResetAtMs: getDrainLimitResetMs(ownLines.join("\n"), Date.now()) };
};
