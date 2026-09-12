import { CLAUDE_CODE_PACKAGE } from "#src/services/coderabbit/collect/constants";
import { REPOSITORY_ROOT } from "#src/services/constants";
import { spawnSync } from "node:child_process";

// Claude Code headless, the prompt on stdin. Permission prompts are skipped because the checkout is ephemeral
// Or dedicated and holds one credential scoped to this repository, so the interactive model protects nothing
// Here and would stall the drain on its first `git commit`. A non-zero exit is the caller's signal that nothing
// It produced may be pushed.
export const runDrain = (prompt: string): boolean => {
  const { status } = spawnSync(
    "pnpm",
    ["dlx", CLAUDE_CODE_PACKAGE, "-p", "--dangerously-skip-permissions", "--output-format", "text"],
    {
      cwd: REPOSITORY_ROOT,
      encoding: "utf8",
      input: prompt,
      shell: process.platform === "win32",
      stdio: ["pipe", "inherit", "inherit"],
    },
  );
  return status === 0;
};
