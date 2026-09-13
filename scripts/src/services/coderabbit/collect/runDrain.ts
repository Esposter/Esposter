import type { DrainRun } from "#src/models/coderabbit/collect/DrainRun";

import { CLAUDE_CODE_PACKAGE } from "#src/services/coderabbit/collect/constants";
import { getDrainLimitResetMs } from "#src/services/coderabbit/collect/getDrainLimitResetMs";
import { REPOSITORY_ROOT } from "#src/services/shared/constants";
import { spawnSync } from "node:child_process";

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

// Stdout is read rather than inherited, because the one thing separating a drain that failed from a drain that
// Never started is the sentence Claude Code prints on its way out. It is echoed whole the moment the session
// Ends, so the run's log says everything it used to — a few minutes later than it used to say it.
export const runDrain = (prompt: string): DrainRun => {
  const environment = Object.fromEntries(
    Object.keys(process.env)
      .filter((key) => !WITHHELD_VARIABLES.has(key))
      .map((key) => [key, process.env[key]]),
  );
  const { status, stdout } = spawnSync(
    "pnpm",
    ["dlx", CLAUDE_CODE_PACKAGE, "-p", "--dangerously-skip-permissions", "--output-format", "text"],
    {
      cwd: REPOSITORY_ROOT,
      encoding: "utf8",
      env: environment,
      input: prompt,
      shell: process.platform === "win32",
      stdio: ["pipe", "pipe", "inherit"],
    },
  );
  console.info(stdout);
  return { isDrained: status === 0, limitResetAtMs: getDrainLimitResetMs(stdout, Date.now()) };
};
