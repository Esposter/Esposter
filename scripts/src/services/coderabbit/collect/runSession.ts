import type { SessionInput } from "#src/models/coderabbit/collect/SessionInput";
import type { SessionRun } from "#src/models/coderabbit/collect/SessionRun";

import { SessionLimitedError } from "#src/models/coderabbit/collect/SessionLimitedError";
import { CLAUDE_CODE_PACKAGE } from "#src/services/coderabbit/collect/constants";
import { getDrainEventLine } from "#src/services/coderabbit/collect/getDrainEventLine";
import { getSessionLimitResetMs } from "#src/services/coderabbit/collect/getSessionLimitResetMs";
import { PNPM_ARGS, PNPM_FILE } from "#src/services/shared/constants";
import { spawn, spawnSync } from "node:child_process";
import { once } from "node:events";
import { createInterface } from "node:readline";

// Claude Code headless, the prompt on stdin, permission prompts skipped: the checkout is ephemeral and holds
// One credential scoped to this repository. The prompt carries CodeRabbit's finding text verbatim — untrusted
// Input steering a session that skips its prompts — so every secret-shaped variable is dropped from the child's
// Environment (a fixed denylist only protects what it already named) and `gh` authenticates the parent alone.
// The one exemption authenticates the `claude` invocation itself.
const EXEMPT_SECRET_VARIABLES = new Set(["CLAUDE_CODE_OAUTH_TOKEN"]);

const SECRET_VARIABLE_REGEX = /credential|key|password|secret|token/iu;
// The one launcher every role goes through, its model handed in rather than fixed here (`SessionRoleModelMap`).
// Stdout is streamed rather than inherited: each event is logged as it lands, and the sentence Claude Code
// Prints on its way out — parsed off its own lines, never the model's narration — is what separates a session
// That failed from one that never started. A limit throws rather than returns: no step can go on without a
// Session, so the pass ends where it stood and the entry point marks when the limit lifts.
export const runSession = async ({ cwd, model, prompt, signal }: SessionInput): Promise<SessionRun> => {
  const environment = Object.fromEntries(
    Object.keys(process.env)
      .filter((key) => EXEMPT_SECRET_VARIABLES.has(key) || !SECRET_VARIABLE_REGEX.test(key))
      .map((key) => [key, process.env[key]]),
  );
  const child = spawn(
    PNPM_FILE,
    [
      ...PNPM_ARGS,
      // The checkout is handed to the resolver mid-conflict, and a conflicted `pnpm-workspace.yaml` is one
      // `pnpm` refuses to parse — so the launch meant to resolve it would fail on it. `dlx` installs outside the
      // Workspace anyway, and the session runs its own `pnpm` for whatever it needs the file for
      "--ignore-workspace",
      "dlx",
      CLAUDE_CODE_PACKAGE,
      "-p",
      "--model",
      model,
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
  const lines = createInterface({ input: child.stdout });
  // A deadline ends the whole tree, and the read with our end of the pipe, since a session `pnpm` launched can outlive
  // It holding stdout open; the run then settles as one that did not end clean
  signal?.addEventListener(
    "abort",
    () => {
      if (process.platform === "win32")
        spawnSync("taskkill", ["/PID", String(child.pid), "/T", "/F"], { stdio: "ignore", windowsHide: true });
      else child.kill();
      lines.close();
      child.stdout.destroy();
    },
    { once: true },
  );
  const ownLines: string[] = [];
  let hasOutput = false;
  for await (const line of lines) {
    hasOutput = true;
    const logLine = getDrainEventLine(line);
    if (logLine === undefined) continue;

    console.info(logLine.text);
    if (!logLine.isNarration) ownLines.push(logLine.text);
  }
  await closed;
  // A limit is a refusal to start, read only off a non-zero exit: the refusal's own result frame states `success`,
  // And reading a clean exit's output for the sentence would discard work over text the session merely echoed
  const isEnded = child.exitCode === 0;
  const limitResetAtMs = isEnded ? undefined : getSessionLimitResetMs(ownLines.join("\n"), Date.now());
  if (limitResetAtMs !== undefined) throw new SessionLimitedError(limitResetAtMs);
  // A session that wrote nothing to its stream never ran — `pnpm` refusing to launch one writes to stderr alone,
  // While the sentence Claude Code prints for itself is a line here, as every event of a session that did run is
  return { isEnded, isStarted: hasOutput };
};
