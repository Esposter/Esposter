import type { ReviewSessionInput } from "#src/models/review/ReviewSessionInput";
import type { ChildProcess } from "node:child_process";

import { ReviewSessionLimitedError } from "#src/models/review/ReviewSessionLimitedError";
import { ReviewSessionRole } from "#src/models/review/ReviewSessionRole";
import {
  CLAUDE_CODE_PACKAGE,
  CLAUDE_EXEMPT_VARIABLE,
  REVIEWER_TOOLS,
  ReviewSessionRoleModelMap,
  SECRET_VARIABLE_REGEX,
  USAGE_LIMIT_REGEX,
} from "#src/services/review/constants";
import { PNPM_ARGS, PNPM_FILE } from "#src/services/shared/constants";
import { getResult, InvalidOperationError, noop, Operation } from "@esposter/shared";
import { spawn, spawnSync } from "@esposter/shared-node/child-process";
import { once } from "node:events";

// The arguments a role's session gets. A reviewer is print mode with only its read-only tools allowed, which denies every
// Other tool, and the fixer and the settler skip their prompts since they edit and commit in their own checkout.
const ReviewSessionRoleArgumentsMap: Record<ReviewSessionRole, string[]> = {
  [ReviewSessionRole.Fixer]: ["--dangerously-skip-permissions"],
  [ReviewSessionRole.Reviewer]: ["--allowedTools", ...REVIEWER_TOOLS],
  [ReviewSessionRole.Settler]: ["--dangerously-skip-permissions"],
};

// Every secret-shaped variable is dropped from the child, except the one that authenticates `claude` itself. A session
// Reads repository text it cannot trust, and `gh` is authenticated in the parent alone.
const getSessionEnvironment = (): NodeJS.ProcessEnv =>
  Object.fromEntries(
    Object.entries(process.env).filter(
      ([key]) => key === CLAUDE_EXEMPT_VARIABLE || !SECRET_VARIABLE_REGEX.test(String(key)),
    ),
  );

// The whole process tree the launch started, not `pnpm` alone: a session it launched can outlive `pnpm`, holding stdout open
const killTree = (child: ChildProcess): void => {
  console.info("the session passed its deadline, so its process tree is killed");
  const { pid } = child;
  if (pid === undefined) return;
  if (process.platform === "win32") {
    spawnSync("taskkill", ["/PID", String(pid), "/T", "/F"], { stdio: "ignore" });
    return;
  }
  // The group's id is its leader's pid, negated to name the group rather than the process
  getResult(() => process.kill(-pid, "SIGKILL")).match(noop, (error) => {
    if (!("code" in error) || error.code !== "ESRCH") console.error(error);
  });
};

// One headless Claude Code session: the prompt on stdin, its output returned whole for `parseReviewAnswer`. A usage limit
// Throws `ReviewSessionLimitedError`, read only off a non-zero exit, since a clean exit's text may only quote the sentence.
// Any other failure throws a plain error.
export const runSession = async ({ cwd, prompt, role, timeoutMs }: ReviewSessionInput): Promise<string> => {
  const child = spawn(
    PNPM_FILE,
    [
      ...PNPM_ARGS,
      // The checkout may be mid-conflict, which `pnpm` refuses to parse, and `dlx` installs outside the workspace anyway
      "--ignore-workspace",
      "dlx",
      CLAUDE_CODE_PACKAGE,
      "-p",
      "--model",
      ReviewSessionRoleModelMap[role],
      "--output-format",
      "json",
      ...ReviewSessionRoleArgumentsMap[role],
    ],
    // Its own process group on POSIX, so the deadline can end the whole tree
    { cwd, detached: process.platform !== "win32", env: getSessionEnvironment(), stdio: ["pipe", "pipe", "pipe"] },
  );
  let stdout = "";
  let stderr = "";
  child.stdout.setEncoding("utf8").on("data", (chunk: string) => {
    stdout += chunk;
  });
  child.stderr.setEncoding("utf8").on("data", (chunk: string) => {
    stderr += chunk;
  });
  // A refusal to start closes the pipe under the write, and the exit status already says what happened
  child.stdin.on("error", console.error);
  child.stdin.end(prompt);

  let isTimedOut = false;
  const timer = setTimeout(() => {
    isTimedOut = true;
    killTree(child);
    child.stdout.destroy();
    child.stderr.destroy();
  }, timeoutMs);
  // Unref'd so a launch that errors before `close` cannot hold the process open for the whole deadline
  timer.unref();
  const [exitCode] = await once(child, "close");
  clearTimeout(timer);

  if (isTimedOut)
    throw new InvalidOperationError(Operation.Create, "review session", `it passed its ${timeoutMs}ms deadline`);
  if (exitCode !== 0) {
    if (USAGE_LIMIT_REGEX.test(`${stdout}\n${stderr}`)) throw new ReviewSessionLimitedError();
    throw new InvalidOperationError(Operation.Create, "review session", `it exited with ${exitCode}: ${stderr.trim()}`);
  }
  // A launch `pnpm` refused writes to stderr alone, so an empty stdout is a session that never ran
  if (stdout.trim() === "")
    throw new InvalidOperationError(Operation.Create, "review session", "none started, since the launch wrote nothing");
  return stdout;
};
