import type { ResumeItem } from "#src/models/resume/ResumeItem";

import { getWorktreeItems } from "#src/services/resume/getWorktreeItems";
import { runToolAsync } from "#src/services/resume/runToolAsync";
import { existsSync, readdirSync } from "node:fs";

export const readWorktreeItems = async (): Promise<ResumeItem[]> =>
  getWorktreeItems(await runToolAsync("git", ["worktree", "list", "--porcelain"]), (directory) =>
    existsSync(directory)
      ? readdirSync(directory, { withFileTypes: true })
          .filter((entry) => entry.isDirectory())
          .map(({ name }) => name)
      : [],
  );
