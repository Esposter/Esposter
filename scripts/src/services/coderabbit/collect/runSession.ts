import type { SessionInput } from "#src/models/coderabbit/collect/SessionInput";
import type { SessionRun } from "#src/models/coderabbit/collect/SessionRun";

import { SessionLimitedError } from "#src/models/coderabbit/collect/SessionLimitedError";
import { SessionUnstartedError } from "#src/models/coderabbit/collect/SessionUnstartedError";
import { assertCycleBudget } from "#src/services/coderabbit/collect/assertCycleBudget";
import { CLAUDE_CODE_PACKAGE, SESSION_TIMEOUT_MS } from "#src/services/coderabbit/collect/constants";
import { getDrainEventLine } from "#src/services/coderabbit/collect/getDrainEventLine";
import { getSessionLimitResetMs } from "#src/services/coderabbit/collect/getSessionLimitResetMs";
import { PNPM_ARGS, PNPM_FILE } from "#src/services/shared/constants";
import { getResult, noop } from "@esposter/shared";
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
// That failed from one Claude Code refused. A limit, a launch that wrote nothing and a session the run's budget cannot
// Hold throw rather than return: no step can go on without a session, so the pass ends where it stood and the entry
// Point decides when the next one runs.
export const runSession = async ({ cwd, model, prompt, signal }: SessionInput): Promise<SessionRun> => {
  // A caller handing its own sooner deadline budgets it itself: the repair before its attempt, and the queue push's
  // Carry runs in no job
  if (signal === undefined) assertCycleBudget(SESSION_TIMEOUT_MS);
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
    // Its own process group on POSIX, so a deadline can end the tree `pnpm` launched rather than `pnpm` alone
    { cwd, detached: process.platform !== "win32", env: environment, stdio: ["pipe", "pipe", "inherit"] },
  );
  // Registered before the read loop: `close` fires on the tick after stdout ends, before the loop resumes
  const closed = once(child, "close");
  // A refusal to start closes the pipe under the write; the exit status already says what happened
  child.stdin.on("error", console.error);
  child.stdin.end(prompt);
  const lines = createInterface({ input: child.stdout });
  // Every session has the wall clock, and a caller's sooner deadline on top of it. Either ends the whole tree, and the
  // Read with our end of the pipe, since a session `pnpm` launched can outlive it holding stdout open and go on
  // Writing the checkout after the collector moved on; the run then settles as one that did not end clean. A group
  // Already gone answers the kill with `ESRCH`, which is the outcome the kill was for
  const deadline = AbortSignal.any([
    AbortSignal.timeout(SESSION_TIMEOUT_MS),
    ...(signal === undefined ? [] : [signal]),
  ]);
  const killTree = (): void => {
    console.info("the session passed its deadline, so its process tree is killed");
    if (process.platform === "win32")
      spawnSync("taskkill", ["/PID", String(child.pid), "/T", "/F"], { stdio: "ignore", windowsHide: true });
    else if (child.pid !== undefined) {
      // The group's id is its leader's pid, negated to name the group rather than the process
      const groupId = -child.pid;
      getResult(() => process.kill(groupId, "SIGKILL")).match(noop, (error) => {
        if (!("code" in error) || error.code !== "ESRCH") console.error(error);
      });
    }
    lines.close();
    child.stdout.destroy();
  };
  deadline.addEventListener("abort", killTree, { once: true });
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
  // The clock outlives the session, and a kill after it closed would name a group whose id the system may have reused
  deadline.removeEventListener("abort", killTree);
  // A limit is a refusal to start, read only off a non-zero exit: the refusal's own result frame states `success`,
  // And reading a clean exit's output for the sentence would discard work over text the session merely echoed
  const isEnded = child.exitCode === 0;
  const limitResetAtMs = isEnded ? undefined : getSessionLimitResetMs(ownLines.join("\n"), Date.now());
  if (limitResetAtMs !== undefined) throw new SessionLimitedError(limitResetAtMs);
  // A session that wrote nothing to its stream never ran — `pnpm` refusing to launch one writes to stderr alone,
  // While the sentence Claude Code prints for itself is a line here, as every event of a session that did run is
  else if (!hasOutput) throw new SessionUnstartedError();
  return { isEnded };
};
