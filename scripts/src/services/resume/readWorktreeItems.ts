import type { ResumeItem } from "#src/models/resume/ResumeItem";

import { getWorktreeItems } from "#src/services/resume/getWorktreeItems";
import { runToolAsync } from "#src/services/resume/runToolAsync";

export const readWorktreeItems = async (): Promise<ResumeItem[]> =>
  getWorktreeItems(await runToolAsync("git", ["worktree", "list", "--porcelain"]));
